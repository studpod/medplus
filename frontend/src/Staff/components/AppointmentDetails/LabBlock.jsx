import { useNavigate } from "react-router-dom";

export default function LabBlock({ item }) {
    const navigate = useNavigate();

    const goToLabPage = () => {
        navigate(`/staff/analyses/${item.id}`);
    };

    return (
        <button className="action-btn" onClick={goToLabPage}>
            Додати результат
        </button>
    );
}