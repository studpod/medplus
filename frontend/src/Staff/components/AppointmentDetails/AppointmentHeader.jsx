export default function AppointmentHeader({ status }) {
    return (
        <div className="page-header">
            <h2>Деталі прийому</h2>

            <div className={`status ${status.class}`}>
                {status.label}
            </div>
        </div>
    );
}