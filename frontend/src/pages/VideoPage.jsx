import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, onSnapshot, addDoc, updateDoc } from "firebase/firestore";

export default function VideoPage() {
    const { room } = useParams();
    const [joined, setJoined] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const pcRef = useRef(null);

    useEffect(() => {
        if (room) joinRoom(room);
    }, [room]);

    const joinRoom = async (roomId) => {
        const roomRef = doc(db, "rooms", roomId);
        const roomSnapshot = await getDoc(roomRef);
        if (!roomSnapshot.exists()) return alert("Room ще не створено лікарем");

        pcRef.current = new RTCPeerConnection();

        // Локальний потік пацієнта
        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach(track => pcRef.current.addTrack(track, localStream));

        // Віддалений потік лікаря
        const remoteStream = new MediaStream();
        remoteVideoRef.current.srcObject = remoteStream;
        pcRef.current.ontrack = event => {
            event.streams[0]?.getTracks().forEach(track => remoteStream.addTrack(track));
        };

        const callerCandidatesCollection = collection(roomRef, "callerCandidates");
        const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

        pcRef.current.onicecandidate = event => {
            if (event.candidate) addDoc(calleeCandidatesCollection, event.candidate.toJSON());
        };

        // Отримуємо offer лікаря
        const roomData = roomSnapshot.data();
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(roomData.offer));

        // Створюємо answer
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);

        // **Оновлюємо тільки поле answer**
        await updateDoc(roomRef, { answer: { type: answer.type, sdp: answer.sdp } });

        // Слухаємо ICE кандидати лікаря
        onSnapshot(callerCandidatesCollection, snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    pcRef.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                }
            });
        });

        setJoined(true);
    };

    return (
        <div>
            <h2>Patient Room: {room}</h2>
            {!joined && <p>Очікування, поки лікар створить кімнату...</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <video ref={localVideoRef} autoPlay muted style={{ width: 300, background: "#000" }} />
                <video ref={remoteVideoRef} autoPlay style={{ width: 300, background: "#000" }} />
            </div>
        </div>
    );
}