import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useNavigate } from "react-router-dom";
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

    const dayMap = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                const res = await API.get("/doctor/view/calendar");


                const mappedEvents = res.data.events.map(e => ({
                    ...e,
                    start: moment.utc(e.start).local().toDate(),
                    end: moment.utc(e.end).local().toDate(),
                    title: e.title, // title вже включає ПІБ + послугу
                    patientId: e.patientId,
                    id: e.id
                }));

                setEvents(mappedEvents);
                setSchedule(res.data.schedule);
            } catch (error) {
                console.error("Calendar load error:", error);
            }
        };
        fetchCalendar();
    }, []);

    const isWorkingSlot = (date) => {
        const day = date.getDay();
        const daySchedules = schedule.filter(s => dayMap[s.day_of_week] === day);
        if (!daySchedules.length) return false;
        const time = moment(date).format("HH:mm:ss");
        return daySchedules.some(s => time >= s.start_time && time < s.end_time);
    };

    const slotPropGetter = (date) => {
        const today = moment().format("YYYY-MM-DD");
        const slotDate = moment(date).format("YYYY-MM-DD");
        const working = isWorkingSlot(date);
        let className = working ? "slot-working" : "slot-off";
        if (slotDate === today) className += " today-slot";
        return { className };
    };

    const dayHeaderWrapper = ({ label, date, ...props }) => {
        const day = date.getDay();
        if (day === 0) return <div style={{ display: "none" }} />;
        return <div {...props}>{label}</div>;
    };

    // Кастомний компонент події
    const EventComponent = ({ event }) => {
        const handleClick = () => {
            if (event.patientId) {
                navigate(`/staff/patient/${event.patientId}/medical-card`);
            }
        };

        return (
            <div className="custom-event" onClick={handleClick} title={event.title}>
                <div className="event-title">{event.title}</div>
            </div>
        );
    };

    return (
        <div className="calendar-container">
            <Calendar
                localizer={localizer}
                events={events}
                date={date}
                view={view}
                onNavigate={setDate}
                onView={setView}
                components={{
                    toolbar: (props) => <StaffCalendarToolbar {...props} view={view} setView={setView} />,
                    header: dayHeaderWrapper,
                    event: EventComponent
                }}
                formats={{ eventTimeRangeFormat: () => "" }}
                startAccessor="start"
                endAccessor="end"
                views={["week", "day"]}
                step={30}
                timeslots={1}
                min={moment().hour(8).minute(0).toDate()}
                max={moment().hour(18).minute(0).toDate()}
                slotPropGetter={slotPropGetter}
                style={{ height: "750px" }}
            />
        </div>
    );
}