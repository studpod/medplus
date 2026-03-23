import React, { useState, useRef, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import VideoCall from "./VideoCall";
import "../../../Staff/pages/video.scss";

export default function StaffWaitingRoom() {
    const { patientId } = useParams();
    const location = useLocation();

    const [started, setStarted] = useState(false);
    const [roomId, setRoomId] = useState("");

    const localVideoRef = useRef(null);

    useEffect(() => {
        if (!started && localVideoRef.current) {
            navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            })
            .then(stream => {
                localVideoRef.current.srcObject = stream;
            })
            .catch(err => console.error(err));
        }
    }, [started]);

    useEffect(() => {
      
        const params = new URLSearchParams(location.search);
        const room = params.get("room");
        if (room) setRoomId(room);
    }, [location.search]);

    const startCall = () => {
        if (!roomId) {
            alert("Помилка: roomId не визначено");
            return;
        }
        setStarted(true);
    };

    if (started && roomId) {
        return <VideoCall role="doctor" roomIdProp={roomId} />;
    }

    return (
        <div className="waiting-room">
            <div className="waiting-left">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="preview-video"
                />
            </div>

            <div className="waiting-right">
                <h2>Підготовка до консультації</h2>
                <p>
                    Переконайтесь, що камера та мікрофон працюють
                    коректно перед початком відеоконсультації.
                </p>
                <button className="join-btn" onClick={startCall}>
                    Розпочати консультацію
                </button>
            </div>
        </div>
    );
}