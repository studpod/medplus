import { useEffect, useState } from "react";
import API from "../../../api";
import { useNavigate } from "react-router-dom";

import CreateAppointmentForm from "../components/AddAppointment/CreateAppointmentForm";
import styles from "../styles/CreateAppointmentPage.module.scss";
import {toast} from "react-toastify";

export default function CreateAppointmentPage() {

    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [isNewPatient, setIsNewPatient] = useState(false);

    const [form, setForm] = useState({

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

        /* APPOINTMENT */
        specialization_id: "",
        doctor_id: "",
        date: "",
        time: "",
        services: []
    });

    useEffect(() => {

        API.get("/receptionist/view/patients")
            .then(res => setPatients(res.data));


        API.get("/staff/view/specializations")
            .then(res => setSpecializations(res.data));

    }, []);

    useEffect(() => {

        if (!form.specialization_id) return;

        API.get(`/staff/view/doctors-by-specialization/${form.specialization_id}`)
            .then(res => setDoctors(res.data));

    }, [form.specialization_id]);

    useEffect(() => {

        if (!form.doctor_id) return;

        API.get(`/receptionist/view/services-by-doctor/${form.doctor_id}`)
            .then(res => setServices(res.data));

    }, [form.doctor_id]);
    useEffect(() => {

        if (!form.doctor_id || !form.date) {
            setAvailableTimes([]);
            return;
        }

        API.get(
            `/receptionist/view/doctor-available-times?doctor_id=${form.doctor_id}&date=${form.date}`
        )
            .then(res => {
                setAvailableTimes(res.data);
            })
            .catch(() => {
                setAvailableTimes([]);
            });

    }, [form.doctor_id, form.date]);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const toggleService = (id) => {

        setForm(prev => {

            const exists = prev.services.includes(id);

            return {
                ...prev,
                services: exists
                    ? prev.services.filter(s => s !== id)
                    : [...prev.services, id]
            };
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await API.post(
                "/receptionist/control/appointments/create",
                form
            );
            toast.success("Запис успішно створенно!")
            navigate("/staff/receptionist/appointments");

        } catch (err) {

            console.log(err);
            toast.error("Помилка при створенні запису!")

        }
    };

    return (
        <div className={styles.page}>

            <div className={styles.header}>
                <h2>Створення прийому</h2>
                <p>Запис пацієнта до лікаря</p>
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