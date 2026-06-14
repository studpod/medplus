import LabBlock from "./LabBlock";

export default function ServiceItem({ item, hasMedicalRecord }) {
    const service = item.service;

    const hasLabResult = item.labs_results && item.labs_results.length > 0;

    return (
        <div className="service">
            <div>
                <div className="service-name">{service?.name}</div>
                <div className="service-type">{service?.type}</div>
            </div>

            {service?.type === "lab_test" ? (
                hasLabResult ? (
                    <div className="status done">Готово</div>
                ) : (
                    <LabBlock item={item} />
                )
            ) : (
                hasMedicalRecord ? (
                    <div className="status done">✅</div>
                ) : (
                    <div className="status pending">—</div>
                )
            )}
        </div>
    );
}