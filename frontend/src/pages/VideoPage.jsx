import React, { useRef, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, onSnapshot, addDoc, updateDoc } from "firebase/firestore";

export default function VideoPage() {
    const { room } = useParams();
    const [joined, setJoined] = useState(false);
    const [mic, setMic] = useState(true);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);

    const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

    useEffect(()=>{ if(room) joinRoom(room); }, [room]);

    const joinRoom = async (roomId) => {
        const roomRef = doc(db, "rooms", roomId);
        const roomSnapshot = await getDoc(roomRef);
        if(!roomSnapshot.exists()){ alert("Кімната не знайдена"); return; }

        pcRef.current = new RTCPeerConnection(configuration);

        const localStream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
        localStreamRef.current = localStream;

        localVideoRef.current.srcObject = localStream;
        localStream.getTracks().forEach(track=>pcRef.current.addTrack(track, localStream));

        pcRef.current.ontrack = (event)=>{
            const stream = event.streams[0];
            if(remoteVideoRef.current.srcObject !== stream) remoteVideoRef.current.srcObject = stream;
            remoteVideoRef.current.muted = false;
            remoteVideoRef.current.onloadedmetadata = ()=>remoteVideoRef.current.play().catch(()=>{});
        };

        const callerCandidates = collection(roomRef, "callerCandidates");
        const calleeCandidates = collection(roomRef, "calleeCandidates");

        pcRef.current.onicecandidate = e=>{ if(e.candidate) addDoc(calleeCandidates, e.candidate.toJSON()); };

        await pcRef.current.setRemoteDescription(new RTCSessionDescription(roomSnapshot.data().offer));

        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        await updateDoc(roomRef, { answer: { type: answer.type, sdp: answer.sdp } });

        onSnapshot(callerCandidates, snapshot=>{
            snapshot.docChanges().forEach(change=>{
                if(change.type==="added") pcRef.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            });
        });

        setJoined(true);
    };

    const toggleMic = ()=>{
        const track = localStreamRef.current.getAudioTracks()[0];
        track.enabled = !track.enabled;
        setMic(track.enabled);
    };

    return (
        <div>
            <h2>Відеоконсультація</h2>
            <p>Кімната: {room}</p>
            {!joined && <p>Підключення...</p>}

            <div style={{display:"flex",gap:20}}>
                <video ref={localVideoRef} autoPlay playsInline muted style={{width:300,background:"#000"}}/>
                <video ref={remoteVideoRef} autoPlay playsInline style={{width:300,background:"#000"}}/>
            </div>

            {/* 🔹 Кнопка Mute */}
            <div style={{marginTop:20}}>
                <button onClick={toggleMic}>{mic ? "🔊 Mic ON" : "🔇 Mic OFF"}</button>
            </div>
        </div>
    );
}