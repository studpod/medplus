import React, { useState, useRef, useEffect } from "react";
import { db } from "../../../firebase";
import {
    doc,
    setDoc,
    collection,
    onSnapshot,
    addDoc,
    deleteDoc
} from "firebase/firestore";

import VideoControls from "./VideoControls";
import "../../../Staff/pages/video.scss";

export default function VideoCall({ roomIdProp }) {
    const [camera, setCamera] = useState(true);
    const [mic, setMic] = useState(true);
    const [currentTime, setCurrentTime] = useState("");

    const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
    const [isSpeakingRemote, setIsSpeakingRemote] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const localStreamRef = useRef(null);
    const fakeStreamRef = useRef(null); // 🔹 для тесту на одному ПК
    const pcRef = useRef(null);
    const roomRefRef = useRef(null);

    const configuration = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

    useEffect(() => { startRoom(); }, []);


    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(
                `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`
            );
        };
        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    /* 🔥 Функція аналізу гучності */
    const detectSpeaking = (stream, setState) => {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const check = () => {
            analyser.getByteFrequencyData(dataArray);
            const volume = dataArray.reduce((a,b)=>a+b,0)/dataArray.length;
            setState(volume > 20 && stream.getAudioTracks()[0].enabled);
            requestAnimationFrame(check);
        };
        check();
    };

    const startRoom = async () => {
        pcRef.current = new RTCPeerConnection(configuration);

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = localStream;


        fakeStreamRef.current = new MediaStream([localStream.getAudioTracks()[0].clone()]);

        localVideoRef.current.srcObject = localStream;
        detectSpeaking(localStream, setIsSpeakingLocal);

        localStream.getTracks().forEach(track => pcRef.current.addTrack(track, localStream));

        pcRef.current.ontrack = (event) => {
            const stream = event.streams[0];
            if (remoteVideoRef.current.srcObject !== stream) {
                remoteVideoRef.current.srcObject = stream;
                detectSpeaking(stream, setIsSpeakingRemote);
            }
            remoteVideoRef.current.muted = false;
            remoteVideoRef.current.onloadedmetadata = () => remoteVideoRef.current.play().catch(()=>{});
        };

        const roomRef = doc(db, "rooms", roomIdProp);
        roomRefRef.current = roomRef;
        const callerCandidates = collection(roomRef, "callerCandidates");
        const calleeCandidates = collection(roomRef, "calleeCandidates");

        pcRef.current.onicecandidate = e => { if (e.candidate) addDoc(callerCandidates, e.candidate.toJSON()); };

        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        await setDoc(roomRef, { offer: { type: offer.type, sdp: offer.sdp } });

        onSnapshot(roomRef, snap => {
            const data = snap.data();
            if (data?.answer && !pcRef.current.currentRemoteDescription)
                pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
        });

        onSnapshot(calleeCandidates, snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type==="added")
                    pcRef.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
            });
        });
    };

    const toggleCamera = () => {
        const track = localStreamRef.current.getVideoTracks()[0];
        track.enabled = !track.enabled;
        setCamera(track.enabled);
    };

    const toggleMic = () => {
        const track = localStreamRef.current.getAudioTracks()[0];
        track.enabled = !track.enabled;
        fakeStreamRef.current.getAudioTracks()[0].enabled = track.enabled;
        setMic(track.enabled);
    };

    const endCall = async () => {
        pcRef.current?.close();
        await deleteDoc(roomRefRef.current);
        localStreamRef.current?.getTracks().forEach(t=>t.stop());
        window.close();
    };

    return (
        <div className="video-room">

            <div className={`remote-video-wrapper ${isSpeakingRemote ? "speaking" : ""}`}>
                <video ref={remoteVideoRef} autoPlay playsInline className="remote-video"/>
                <div className="username">Пацієнт</div>
            </div>

            <div className={`local-video-wrapper ${isSpeakingLocal ? "speaking" : ""}`}>
                <video ref={localVideoRef} autoPlay playsInline muted/>
                <div className="username">Ви</div>
            </div>

            <VideoControls
                mic={mic}
                camera={camera}
                toggleMic={toggleMic}
                toggleCamera={toggleCamera}
                endCall={endCall}
            />

            <div className="room-info">{currentTime} | {roomIdProp}</div>
        </div>
    );
}