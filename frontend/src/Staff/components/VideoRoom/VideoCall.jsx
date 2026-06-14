import React, { useEffect, useRef, useState } from "react";
import styles from "./VideoCall.module.scss";

import { db } from "../../../firebase";
import {
    doc,
    setDoc,
    collection,
    addDoc,
    onSnapshot
} from "firebase/firestore";

import VideoControls from "./VideoControls";

export default function VideoCall({ roomIdProp }) {

    const [mic, setMic] = useState(true);
    const [cam, setCam] = useState(true);

    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const pc = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        if (!roomIdProp) return;

        const start = async () => {
            pc.current = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            streamRef.current = stream;
            localVideo.current.srcObject = stream;

            stream.getTracks().forEach(track =>
                pc.current.addTrack(track, stream)
            );

            const roomRef = doc(db, "rooms", roomIdProp);
            const callerCandidates = collection(roomRef, "callerCandidates");
            const calleeCandidates = collection(roomRef, "calleeCandidates");

            onSnapshot(roomRef, (snap) => {
                const data = snap.data();
                if (!data) return;

                if (data.answer && !pc.current.currentRemoteDescription) {
                    pc.current.setRemoteDescription(
                        new RTCSessionDescription(data.answer)
                    );
                }
            });

            pc.current.onicecandidate = (e) => {
                if (e.candidate) {
                    addDoc(callerCandidates, e.candidate.toJSON());
                }
            };

            onSnapshot(calleeCandidates, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        pc.current.addIceCandidate(
                            new RTCIceCandidate(change.doc.data())
                        );
                    }
                });
            });

            pc.current.ontrack = (event) => {
                remoteVideo.current.srcObject = event.streams[0];
            };

            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);

            await setDoc(roomRef, {
                offer: {
                    type: offer.type,
                    sdp: offer.sdp
                }
            }, { merge: true });
        };

        start();

        return () => {
            streamRef.current?.getTracks().forEach(t => t.stop());
            pc.current?.close();
        };
    }, [roomIdProp]);

    const toggleMic = () => {
        const stream = streamRef.current;
        if (!stream) return;

        const track = stream.getAudioTracks()[0];
        if (!track) return;

        track.enabled = !track.enabled;
        setMic(track.enabled);
    };

    const toggleCamera = () => {
        const stream = streamRef.current;
        if (!stream) return;

        const track = stream.getVideoTracks()[0];
        if (!track) return;

        track.enabled = !track.enabled;
        setCam(track.enabled);
    };

    const endCall = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        pc.current?.close();
        window.location.href = "/";
    };

    return (
        <div className={styles.room}>

            <div className={styles.remote}>
                <video
                    ref={remoteVideo}
                    autoPlay
                    playsInline
                    className={styles.remoteVideo}
                />
                <div className={styles.remoteLabel}>
                    Пацієнт
                </div>
            </div>

            <div className={styles.local}>
                <video
                    ref={localVideo}
                    autoPlay
                    playsInline
                    muted
                    className={styles.localVideo}
                />
            </div>

            <VideoControls
                mic={mic}
                camera={cam}
                toggleMic={toggleMic}
                toggleCamera={toggleCamera}
                endCall={endCall}
            />

        </div>
    );
}