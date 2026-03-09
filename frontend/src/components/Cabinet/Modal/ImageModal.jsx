import { useEffect, useState } from "react";
import { FaSearchPlus, FaSearchMinus, FaTimes } from "react-icons/fa";
import "./ImageModal.scss";

export default function ImageModal({ src, onClose }) {
    const [scale, setScale] = useState(1);

    const handleWheel = (e) => {
        e.preventDefault();

        let newScale = scale + e.deltaY * -0.001;
        newScale = Math.max(0.2, Math.min(5, newScale));

        setScale(newScale);
    };

    const zoomIn = () => setScale((s) => Math.min(5, s + 0.2));
    const zoomOut = () => setScale((s) => Math.max(0.2, s - 0.2));

    useEffect(() => {
        window.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            window.removeEventListener("wheel", handleWheel);
        };
    }, [scale]);

    return (
        <div className="image-modal-overlay" onClick={onClose}>

            {/* кнопка закриття */}
            <button className="modal-close-btn" onClick={onClose}>
                <FaTimes />
            </button>

            {/* картинка */}
            <div
                className="image-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={src}
                    alt="Preview"
                    className="modal-image"
                    style={{ transform: `scale(${scale})` }}
                />
            </div>

            {/* кнопки zoom */}
            <div className="modal-zoom-controls">
                <button onClick={zoomIn}>
                    <FaSearchPlus />
                </button>

                <button onClick={zoomOut}>
                    <FaSearchMinus />
                </button>
            </div>

        </div>
    );
}