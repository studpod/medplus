import ServiceItem from "./ServiceItem";


export default function Services({ appointment, refresh }) {

    const hasMedicalRecord = !!appointment.medical_record;

    return (
        <div className="card">
            <div className="card-title">Послуги</div>

            <div className="services">
                {appointment.appointment_services.map(item => (
                    <ServiceItem
                        key={item.id}
                        item={item}
                        refresh={refresh}
                        hasMedicalRecord={hasMedicalRecord}
                    />
                ))}
            </div>
        </div>
    );
}