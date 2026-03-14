import React, { useState, useRef, useEffect } from "react";
import { db } from "../../firebase";
import { doc, setDoc, collection, onSnapshot, addDoc } from "firebase/firestore";

export default function StaffVideoRoom() {
    const [roomId, setRoomId] = useState("");
    const [started, setStarted] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const pcRef = useRef(null);

    const startRoom = async () => {
        const newRoom = "call_" + Math.floor(Math.random() * 1000000);
        setRoomId(newRoom);
        setStarted(true);

        setTimeout(async () => {
            pcRef.current = new RTCPeerConnection();

            // Локальний потік лікаря
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
            localStream.getTracks().forEach(track => pcRef.current.addTrack(track, localStream));

            // Віддалений потік пацієнта
            const remoteStream = new MediaStream();
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
            pcRef.current.ontrack = event => {
                event.streams[0]?.getTracks().forEach(track => remoteStream.addTrack(track));
            };

            const roomRef = doc(db, "rooms", newRoom);
            const callerCandidatesCollection = collection(roomRef, "callerCandidates");
            const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

            pcRef.current.onicecandidate = event => {
                if (event.candidate) addDoc(callerCandidatesCollection, event.candidate.toJSON());
            };

            // Створюємо offer
            const offer = await pcRef.current.createOffer();
            await pcRef.current.setLocalDescription(offer);
            await setDoc(roomRef, { offer: { type: offer.type, sdp: offer.sdp } });

            // Слухаємо answer від пацієнта
            onSnapshot(roomRef, snapshot => {
                const data = snapshot.data();
                if (data?.answer && !pcRef.current.currentRemoteDescription) {
                    pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                }
            });

            // Слухаємо ICE кандидати від пацієнта
            onSnapshot(calleeCandidatesCollection, snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === "added") {
                        pcRef.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                    }
                });
            });
        }, 100);
    };

    return (
        <div>
            <h2>Staff Video Room</h2>
            {!started ? (
                <button onClick={startRoom} style={{ padding: "10px 20px" }}>
                    Start Room
                </button>
            ) : (
                <>
                    <p>Room ID: {roomId} (скопіюйте для пацієнта)</p>
                    <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                        <video ref={localVideoRef} autoPlay muted style={{ width: 300, background: "#000" }} />
                        <video ref={remoteVideoRef} autoPlay style={{ width: 300, background: "#000" }} />
                    </div>
                </>
            )}
        </div>
    );
}