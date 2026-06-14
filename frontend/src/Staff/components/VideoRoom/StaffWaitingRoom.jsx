import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import VideoCall from "./VideoCall";
import styles from "./StaffWaitingRoom.module.scss";

export default function StaffWaitingRoom() {
    const location = useLocation();

    const [started, setStarted] = useState(false);
    const [roomId, setRoomId] = useState("");

    const localVideoRef = useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const room = params.get("room");
        if (room) setRoomId(room);
    }, [location.search]);

    useEffect(() => {
        let stream;

        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (e) {
                console.error(e);
            }
        };

        startCamera();

        return () => {
            stream?.getTracks().forEach(t => t.stop());
        };
    }, []);

    const startCall = () => {
        if (!roomId) return alert("No roomId");
        setStarted(true);
    };

    if (started && roomId) {
        return <VideoCall roomIdProp={roomId} />;
    }

    return (
        <div className={styles.wrapper}>

            <div className={styles.left}>
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={styles.videoPreview}
                />
            </div>

            <div className={styles.right}>
                <h2 className={styles.title}>
                    Підготовка до консультації
                </h2>

                <p className={styles.text}>
                    Перевірте камеру та мікрофон перед початком дзвінка.
                    Після старту ви приєднаєтесь до пацієнта.
                </p>

                <button className={styles.btn} onClick={startCall}>
                    Розпочати консультацію
                </button>
            </div>

        </div>
    );
}