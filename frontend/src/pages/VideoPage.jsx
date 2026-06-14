import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
    doc,
    getDoc,
    collection,
    addDoc,
    onSnapshot,
    updateDoc
} from "firebase/firestore";

import {
    FiMic,
    FiMicOff,
    FiVideo,
    FiVideoOff,
    FiPhoneOff
} from "react-icons/fi";

import styles from "./VideoCall.module.scss";

export default function VideoPage() {
    const { room } = useParams();
    const navigate = useNavigate();

    const [mic, setMic] = useState(true);
    const [cam, setCam] = useState(true);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const pcRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        if (!room) return;

        const join = async () => {
            const roomRef = doc(db, "rooms", room);
            const roomSnap = await getDoc(roomRef);
            if (!roomSnap.exists()) return;

            pcRef.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            streamRef.current = stream;
            localVideoRef.current.srcObject = stream;

            stream.getTracks().forEach(track =>
                pcRef.current.addTrack(track, stream)
            );

            const callerCandidates = collection(roomRef, "callerCandidates");
            const calleeCandidates = collection(roomRef, "calleeCandidates");

            pcRef.current.ontrack = (event) => {
                remoteVideoRef.current.srcObject = event.streams[0];
            };

            pcRef.current.onicecandidate = (e) => {
                if (e.candidate) {
                    addDoc(calleeCandidates, e.candidate.toJSON());
                }
            };

            onSnapshot(callerCandidates, (snapshot) => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        pcRef.current.addIceCandidate(
                            new RTCIceCandidate(change.doc.data())
                        );
                    }
                });
            });

            const data = roomSnap.data();

            await pcRef.current.setRemoteDescription(
                new RTCSessionDescription(data.offer)
            );

            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);

            await updateDoc(roomRef, {
                answer: {
                    type: answer.type,
                    sdp: answer.sdp
                }
            });
        };

        join();

        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
            pcRef.current?.close();
        };
    }, [room]);

    const toggleMic = () => {
        const track = streamRef.current?.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setMic(track.enabled);
    };

    const toggleCam = () => {
        const track = streamRef.current?.getVideoTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        setCam(track.enabled);
    };

    const endCall = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        pcRef.current?.close();
        navigate("/", { replace: true });
    };

    return (
        <div className={styles.room}>

            <div className={styles.remote}>
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className={styles.remoteVideo}
                />
                <div className={styles.remoteLabel}>Лікар</div>
            </div>

            <div className={styles.local}>
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={styles.localVideo}
                />
                <div className={styles.remoteLabel}>Ви</div>
            </div>

            {/* CONTROLS */}
            <div className={styles.controls}>

                <button className={styles.btn} onClick={toggleMic}>
                    {mic ? <FiMic /> : <FiMicOff />}
                </button>

                <button className={styles.btn} onClick={toggleCam}>
                    {cam ? <FiVideo /> : <FiVideoOff />}
                </button>

                <button className={`${styles.btn} ${styles.end}`} onClick={endCall}>
                    <FiPhoneOff />
                </button>

            </div>

        </div>
    );
}