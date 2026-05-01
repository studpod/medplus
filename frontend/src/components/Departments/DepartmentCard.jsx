import { useNavigate } from "react-router-dom";

export default function DepartmentCard({ dep }) {
    const navigate = useNavigate();

    return (
        <div className="departments__card">

            <div className="departments__icon">
                <i className={`fas ${dep.icon}`} />
            </div>

            <h3>{dep.name}</h3>
            <p>{dep.desc}</p>

            <div className="departments__actions">

                <button
                    className="btn-primary"
                    onClick={() => navigate("/reception")}
                >
                    Записатись
                </button>

                <button
                    className="btn-outline"
                    onClick={() => navigate(`/departments/${dep.slug}`)}
                >
                    Детальніше
                </button>

            </div>
        </div>
    );
}