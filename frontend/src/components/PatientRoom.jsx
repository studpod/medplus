import React, { useRef, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, getDoc, collection, onSnapshot, addDoc } from "firebase/firestore";

export default function PatientRoom({ roomId }) {
    const [joined, setJoined] = useState(false);
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const pcRef = useRef(null);

    const joinRoom = async () => {
        if (!roomId) return alert("Room ID не передано");

        const roomRef = doc(db, "rooms", roomId);
        const roomSnapshot = await getDoc(roomRef);
        if (!roomSnapshot.exists()) return alert("Room ще не створено лікарем");

        pcRef.current = new RTCPeerConnection();

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach(track => pcRef.current.addTrack(track, localStream));

        const remoteStream = new MediaStream();
        remoteVideoRef.current.srcObject = remoteStream;
        pcRef.current.ontrack = event => {
            if (event.streams[0]) event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
        };

        const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");
        pcRef.current.onicecandidate = event => {
            if (event.candidate) addDoc(calleeCandidatesCollection, event.candidate.toJSON());
        };

        const roomData = roomSnapshot.data();
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(roomData.offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);

        await addDoc(roomRef, { answer: { type: answer.type, sdp: answer.sdp } });

        const callerCandidatesCollection = collection(roomRef, "callerCandidates");
        onSnapshot(callerCandidatesCollection, snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    pcRef.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                }
            });
        });

        setJoined(true);
    };

    useEffect(() => {
        if (roomId) joinRoom();
    }, [roomId]);

    return (
        <div>
            <h2>Patient Room: {roomId}</h2>
            {!joined && <p>Очікування, поки лікар запустить кімнату...</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <video ref={localVideoRef} autoPlay muted style={{ width: 300 }} />
                <video ref={remoteVideoRef} autoPlay style={{ width: 300 }} />
            </div>
        </div>
    );
}