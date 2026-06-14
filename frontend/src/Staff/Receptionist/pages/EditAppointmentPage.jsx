import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../../api";
import { toast } from "react-toastify";

import CreateAppointmentForm from "../components/AddAppointment/CreateAppointmentForm";
import styles from "../styles/CreateAppointmentPage.module.scss";

export default function EditAppointmentPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [patients, setPatients] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);

    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isNewPatient, setIsNewPatient] = useState(false);

    const [form, setForm] = useState({
        id: null,
        patient_id: "",
        new_patient: false,

        last_name: "",
        first_name: "",
        middle_name: "",
        gender: "",
        address: "",
        date_of_birth: "",
        phone: "",
        notes: "",

        specialization_id: "",
        doctor_id: "",
        date: "",
        time: "",
        services: []
    });


    useEffect(() => {
        const load = async () => {
            try {
                const [patientsRes, specRes, appointmentRes] = await Promise.all([
                    API.get("/receptionist/view/patients"),
                    API.get("/staff/view/specializations"),
                    API.get(`/receptionist/view/appointments/${id}`)
                ]);

                setPatients(patientsRes.data || []);
                setSpecializations(specRes.data || []);

                const a = appointmentRes.data?.appointment;

                if (!a) {
                    toast.error("Прийом не знайдено");
                    return;
                }

                setForm({
                    id: a.id,

                    patient_id: a.patient_id || "",
                    new_patient: false,

                    last_name: a.patient?.last_name || "",
                    first_name: a.patient?.first_name || "",
                    middle_name: a.patient?.middle_name || "",
                    gender: a.patient?.gender || "",
                    address: a.patient?.address || "",
                    date_of_birth: a.patient?.date_of_birth || "",
                    phone: a.patient?.phone || "",
                    notes: a.patient?.notes || "",

                    specialization_id: a.doctor?.specialization_id || "",
                    doctor_id: a.doctor_id || "",
                    date: a.date || "",
                    time: a.time ? a.time.slice(0, 5) : "",

                    services: a.services?.map(s => s.service_id) || []
                });

                setSelectedPatient({
                    ...a.patient,
                    doctor_full_name: a.patient?.doctor_full_name || null
                });

            } catch (e) {
                console.log(e);
                toast.error("Помилка завантаження прийому");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);


    useEffect(() => {
        if (!form.specialization_id) return;

        API.get(`/staff/view/doctors-by-specialization/${form.specialization_id}`)
            .then(res => setDoctors(res.data || []))
            .catch(() => setDoctors([]));
    }, [form.specialization_id]);


    useEffect(() => {
        if (!form.doctor_id) return;

        API.get(`/receptionist/view/services-by-doctor/${form.doctor_id}`)
            .then(res => setServices(res.data || []))
            .catch(() => setServices([]));
    }, [form.doctor_id]);


    useEffect(() => {
        if (!form.doctor_id || !form.date) {
            setAvailableTimes([]);
            return;
        }

        API.get(`/receptionist/view/doctor-available-times`, {
            params: {
                doctor_id: form.doctor_id,
                date: form.date,
                exclude_appointment_id: form.id
            }
        })
            .then(res => setAvailableTimes(res.data || []))
            .catch(() => setAvailableTimes([]));
    }, [form.doctor_id, form.date]);


    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const toggleService = (id) => {
        setForm(prev => ({
            ...prev,
            services: prev.services.includes(id)
                ? prev.services.filter(s => s !== id)
                : [...prev.services, id]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await API.put(`/receptionist/control/appointments/${id}`, form);

            toast.success("Прийом оновлено!");
            navigate("/staff/receptionist/appointments");

        } catch (e) {
            console.log(e);
            toast.error("Помилка оновлення прийому");
        }
    };

    if (loading) return <div>Завантаження...</div>;

    return (
        <div className={styles.page}>

            <div className={styles.header}>
                <h2>Редагування прийому</h2>
                <p>Оновлення запису пацієнта</p>
            </div>

            <CreateAppointmentForm
                form={form}
                setForm={setForm}
                patients={patients}
                specializations={specializations}
                doctors={doctors}
                services={services}
                availableTimes={availableTimes}
                selectedPatient={selectedPatient}
                setSelectedPatient={setSelectedPatient}
                handleChange={handleChange}
                toggleService={toggleService}
                handleSubmit={handleSubmit}
                isNewPatient={isNewPatient}
                setIsNewPatient={setIsNewPatient}
            />

        </div>
    );
}