import React, { useState } from "react";
import DatePicker from "react-datepicker";
import moment from "moment";
import "react-datepicker/dist/react-datepicker.css";
import "moment/locale/uk";

moment.locale("uk");

export default function StaffCalendarToolbar({ date, onNavigate, view, setView }) {

    const [open, setOpen] = useState(false);

    const startOfWeek = moment(date).startOf("week");
    const endOfWeek = moment(date).endOf("week");


    const formattedLabel = view === "week"
        ? `${startOfWeek.format("DD MMM")} – ${endOfWeek.format("DD MMM YYYY")}`
        : moment(date).format("dddd, DD MMM YYYY"); // для day view

    const handleDateChange = (selectedDate) => {
        onNavigate("DATE", selectedDate);
        setOpen(false);
    };

    const goPrev = () => onNavigate("PREV");
    const goNext = () => onNavigate("NEXT");
    const goCurrent = () => onNavigate("TODAY");

    return (
        <div className="calendar-toolbar">

            {/* Кнопки навігації */}
            <div className="toolbar-left">
                <button onClick={goPrev}>←</button>
                <button onClick={goCurrent}>Поточна</button>
                <button onClick={goNext}>→</button>
            </div>

            {/* Кнопка для вибору дати */}
            <div className="toolbar-center">
                <button className="date-button" onClick={() => setOpen(!open)}>
                    {formattedLabel}
                </button>

                {open && (
                    <div className="datepicker-popup">
                        <DatePicker
                            inline
                            selected={date}
                            onChange={handleDateChange}
                        />
                    </div>
                )}
            </div>


            <div className="toolbar-right">
                <button
                    className={view === "week" ? "active" : ""}
                    onClick={() => setView("week")}
                >
                    Тиждень
                </button>
                <button
                    className={view === "day" ? "active" : ""}
                    onClick={() => setView("day")}
                >
                    День
                </button>
            </div>

        </div>
    );
}