import React, { useRef, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, collection, onSnapshot, addDoc } from "firebase/firestore";

export default function DoctorRoom() {
    const [roomId, setRoomId] = useState("");
    const [started, setStarted] = useState(false);
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const pcRef = useRef(null);

    useEffect(() => {
        // Генеруємо Room при першому рендері
        const newRoom = "call_" + Math.floor(Math.random() * 1000000);
        setRoomId(newRoom);
    }, []);

    const startRoom = async () => {
        if (!roomId) return;

        pcRef.current = new RTCPeerConnection();

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach(track => pcRef.current.addTrack(track, localStream));

        const remoteStream = new MediaStream();
        remoteVideoRef.current.srcObject = remoteStream;
        pcRef.current.ontrack = event => {
            if (event.streams[0]) event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
        };

        const roomRef = doc(db, "rooms", roomId);
        const callerCandidatesCollection = collection(roomRef, "callerCandidates");
        pcRef.current.onicecandidate = event => {
            if (event.candidate) addDoc(callerCandidatesCollection, event.candidate.toJSON());
        };

        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        await setDoc(roomRef, { offer: { type: offer.type, sdp: offer.sdp } });

        // Слухаємо відповідь пацієнта
        onSnapshot(roomRef, snapshot => {
            const data = snapshot.data();
            if (!pcRef.current.currentRemoteDescription && data?.answer) {
                pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        });

        const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");
        onSnapshot(calleeCandidatesCollection, snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    pcRef.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                }
            });
        });

        setStarted(true);
    };

    return (
        <div>
            <h2>Doctor Room: {roomId}</h2>
            {!started ? (
                <button onClick={startRoom} style={{ padding: "10px 20px" }}>
                    Start Room
                </button>
            ) : (
                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                    <video ref={localVideoRef} autoPlay muted style={{ width: 300 }} />
                    <video ref={remoteVideoRef} autoPlay style={{ width: 300 }} />
                </div>
            )}
        </div>
    );
}