import { FcOk, FcProcess } from "react-icons/fc";

export default function AppointmentServices({ appointment, navigate }) {

    const getServiceTypeLabel = (type) => {
        switch (type) {
            case "consultation": return "Консультація";
            case "diagnostics": return "Діагностика";
            case "lab_test": return "Аналіз";
            case "checkup": return "Чекап";
            default: return type;
        }
    };

    return (
        <div className="card services-card">
            <div className="card-title">Послуги</div>

            <div className="services-list">
                {appointment.appointment_services.map(item => {

                    const type = item.service?.type;

                    const labDone = item.labs_results?.length > 0;

                    const diagnosticsDone = !!item.diagnostic_report?.id;

                    const consultationDone = !!appointment.medical_record;

                    return (
                        <div key={item.id} className="service-row">

                            <div>
                                <div className="service-name">
                                    {item.service?.name} {item.service?.price}
                                </div>

                                <div className={`service-type type-${type}`}>
                                    {getServiceTypeLabel(type)}
                                </div>
                            </div>

                            <div className="service-status">
                                {type === "lab_test" && (
                                    labDone
                                        ? <span className="done"><FcOk /></span>
                                        : (
                                            <button
                                                className="add-lab-btn"
                                                onClick={() => navigate(`/staff/analyses/${item.id}`)}
                                            >
                                                ➕ Додати
                                            </button>
                                        )
                                )}

                                {/* DIAGNOSTICS */}
                                {type === "diagnostics" && (
                                    diagnosticsDone
                                        ? <span className="done"><FcOk /></span>
                                        : <FcProcess />
                                )}

                                {["consultation", "checkup"].includes(type) && (
                                    consultationDone
                                        ? <FcOk />
                                        : <FcProcess />
                                )}

                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}