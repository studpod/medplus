import React, {
    useEffect,
    useState
} from "react";

import {
    Calendar,
    momentLocalizer
} from "react-big-calendar";

import moment from "moment";

import {
    useNavigate
} from "react-router-dom";

import StaffCalendarToolbar from "./StaffCalendarToolbar";

import "react-big-calendar/lib/css/react-big-calendar.css";

import "../styles/staffCalendar.scss";

import API from "../../api";

moment.locale("uk");

const localizer = momentLocalizer(moment);

export default function StaffCalendar() {

    const navigate = useNavigate();

    const [events, setEvents] = useState([]);

    const [schedule, setSchedule] = useState([]);

    const [date, setDate] = useState(new Date());

    const [view, setView] = useState("week");

    const [user] = useState(
        JSON.parse(localStorage.getItem("staff_user"))
    );

    /*
    |--------------------------------------------------------------------------
    | RECEPTIONIST
    |--------------------------------------------------------------------------
    */

    const isReceptionist =
        user?.role === "receptionist";

    const [specializations, setSpecializations] = useState([]);

    const [doctors, setDoctors] = useState([]);

    const [selectedSpecialization, setSelectedSpecialization] =
        useState("");

    const [selectedDoctor, setSelectedDoctor] =
        useState("");

    const dayMap = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6
    };

    /*
    |--------------------------------------------------------------------------
    | LOAD SPECIALIZATIONS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!isReceptionist) return;

        API.get("/staff/view/specializations")
            .then(res => {
                setSpecializations(res.data);
            });

    }, []);

    /*
    |--------------------------------------------------------------------------
    | LOAD DOCTORS
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!selectedSpecialization) return;

        API.get(
            `/staff/view/doctors-by-specialization/${selectedSpecialization}`
        )
            .then(res => {
                setDoctors(res.data);
            });

    }, [selectedSpecialization]);

    /*
    |--------------------------------------------------------------------------
    | LOAD CALENDAR
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const fetchCalendar = async () => {

            try {

                let url = "/staff/view/calendar";

                if (isReceptionist) {

                    if (!selectedDoctor) {

                        setEvents([]);
                        setSchedule([]);

                        return;
                    }

                    url += `?doctor_id=${selectedDoctor}`;
                }

                const res = await API.get(url);

                const mappedEvents = res.data.events.map(e => ({
                    ...e,

                    start: moment
                        .utc(e.start)
                        .local()
                        .toDate(),

                    end: moment
                        .utc(e.end)
                        .local()
                        .toDate(),

                    title: e.title,

                    patientId: e.patientId,

                    id: e.id
                }));

                setEvents(mappedEvents);

                setSchedule(res.data.schedule);

            } catch (error) {

                console.error(
                    "Calendar load error:",
                    error
                );
            }
        };

        fetchCalendar();

    }, [selectedDoctor]);

    /*
    |--------------------------------------------------------------------------
    | WORKING SLOT
    |--------------------------------------------------------------------------
    */

    const isWorkingSlot = (date) => {

        const day = date.getDay();

        const daySchedules = schedule.filter(
            s => dayMap[s.day_of_week] === day
        );

        if (!daySchedules.length) return false;

        const time = moment(date).format("HH:mm:ss");

        return daySchedules.some(
            s =>
                time >= s.start_time &&
                time < s.end_time
        );
    };

    const slotPropGetter = (date) => {

        const today =
            moment().format("YYYY-MM-DD");

        const slotDate =
            moment(date).format("YYYY-MM-DD");

        const working = isWorkingSlot(date);

        let className = working
            ? "slot-working"
            : "slot-off";

        if (slotDate === today) {
            className += " today-slot";
        }

        return { className };
    };

    /*
    |--------------------------------------------------------------------------
    | HEADER
    |--------------------------------------------------------------------------
    */

    const dayHeaderWrapper = ({
                                  label,
                                  date,
                                  ...props
                              }) => {

        const day = date.getDay();

        if (day === 0) {

            return (
                <div style={{ display: "none" }} />
            );
        }

        return (
            <div {...props}>
                {label}
            </div>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | EVENT
    |--------------------------------------------------------------------------
    */

    const EventComponent = ({ event }) => {

        const handleClick = () => {

            if (event.patientId) {

                navigate(
                    `/staff/patient/${event.patientId}/medical-card`
                );
            }
        };

        return (
            <div
                className="custom-event"
                onClick={handleClick}
                title={event.title}
            >
                <div className="event-title">
                    {event.title}
                </div>
            </div>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | CREATE APPOINTMENT
    |--------------------------------------------------------------------------
    */

    const handleCreateAppointment = () => {
        navigate("/staff/appointments/create");
    };

    return (
        <div>

            {/* RECEPTIONIST FILTERS */}

            {isReceptionist && (

                <div
                    className="staff-calendar-filters"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        marginBottom: "20px",
                        flexWrap: "wrap"
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            gap: "12px",
                            flexWrap: "wrap"
                        }}
                    >

                        <select
                            className="staff-calendar-select"
                            value={selectedSpecialization}
                            onChange={(e) => {

                                setSelectedSpecialization(
                                    e.target.value
                                );

                                setSelectedDoctor("");
                            }}
                        >

                            <option value="">
                                Оберіть спеціалізацію
                            </option>

                            {specializations.map(spec => (

                                <option
                                    key={spec.id}
                                    value={spec.id}
                                >
                                    {spec.name}
                                </option>

                            ))}

                        </select>

                        <select
                            className="staff-calendar-select"
                            value={selectedDoctor}
                            onChange={(e) =>
                                setSelectedDoctor(
                                    e.target.value
                                )
                            }
                            disabled={!selectedSpecialization}
                        >

                            <option value="">
                                Оберіть лікаря
                            </option>

                            {doctors.map(doc => (

                                <option
                                    key={doc.id}
                                    value={doc.id}
                                >
                                    {doc.last_name} {doc.first_name}
                                </option>

                            ))}

                        </select>

                    </div>

                    {/* BUTTON */}

                    <button
                        onClick={handleCreateAppointment}
                        style={{
                            background: "#457b9d",
                            color: "#fff",
                            border: "none",
                            padding: "10px 18px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: "600",
                            whiteSpace: "nowrap"
                        }}
                    >
                        <i
                            className="fas fa-plus"
                            style={{
                                marginRight: "8px"
                            }}
                        />

                        Додати прийом
                    </button>

                </div>
            )}

            <div className="calendar-container">

                <Calendar
                    localizer={localizer}
                    events={events}
                    date={date}
                    view={view}
                    onNavigate={setDate}
                    onView={setView}
                    components={{

                        toolbar: (props) => (
                            <StaffCalendarToolbar
                                {...props}
                                view={view}
                                setView={setView}
                            />
                        ),

                        header: dayHeaderWrapper,

                        event: EventComponent
                    }}

                    formats={{
                        eventTimeRangeFormat: () => ""
                    }}

                    startAccessor="start"

                    endAccessor="end"

                    views={["week", "day"]}

                    step={30}

                    timeslots={1}

                    min={
                        moment()
                            .hour(8)
                            .minute(0)
                            .toDate()
                    }

                    max={
                        moment()
                            .hour(18)
                            .minute(0)
                            .toDate()
                    }

                    slotPropGetter={slotPropGetter}

                    style={{ height: "750px" }}
                />

            </div>

        </div>
    );
}