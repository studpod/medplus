import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, collection, onSnapshot, addDoc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import "../Staff/pages/video.scss";

export default function VideoPage() {
    const { room } = useParams();
    const navigate = useNavigate();

    const [joined, setJoined] = useState(false);
    const [mic,setMic] = useState(true);
    const [camera,setCamera] = useState(true);
    const [isSpeakingLocal,setIsSpeakingLocal] = useState(false);
    const [isSpeakingRemote,setIsSpeakingRemote] = useState(false);
    const callEndedToastShown = useRef(false);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const pcRef = useRef(null);
    const localStreamRef = useRef(null);

    const configuration = { iceServers:[{urls:"stun:stun.l.google.com:19302"}] };

    useEffect(()=>{ if(room) joinRoom(room); },[room]);

    const detectSpeaking = (stream,setState)=>{
        if(!stream) return;
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const check = ()=>{
            const track = stream.getAudioTracks()[0];
            if(!track || !track.enabled) setState(false);
            else{
                analyser.getByteFrequencyData(dataArray);
                const volume = dataArray.reduce((a,b)=>a+b,0)/dataArray.length;
                setState(volume>25);
            }
            requestAnimationFrame(check);
        };
        check();
    };

    const joinRoom = async (roomId)=>{
        const roomRef = doc(db,"rooms",roomId);
        const roomSnapshot = await getDoc(roomRef);
        if(!roomSnapshot.exists()){
            if(!callEndedToastShown.current){
                toast.info("Лікар завершив дзвінок");
                callEndedToastShown.current = true;
            }
            navigate("/", { replace:true });
            return;
        }

        pcRef.current = new RTCPeerConnection(configuration);
        const localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
        localStreamRef.current = localStream;
        localVideoRef.current.srcObject = localStream;

        detectSpeaking(localStream,setIsSpeakingLocal);
        localStream.getTracks().forEach(track=>pcRef.current.addTrack(track,localStream));

        pcRef.current.ontrack = (event)=>{
            const stream = event.streams[0];
            if(remoteVideoRef.current.srcObject !== stream){
                if(remoteVideoRef.current?.srcObject){
                    remoteVideoRef.current.srcObject.getTracks().forEach(t=>t.stop());
                }
                remoteVideoRef.current.srcObject = stream;
                detectSpeaking(stream,setIsSpeakingRemote);
            }
            remoteVideoRef.current.muted = false;
        };

        const callerCandidates = collection(roomRef,"callerCandidates");
        const calleeCandidates = collection(roomRef,"calleeCandidates");

        pcRef.current.onicecandidate = e=>{if(e.candidate) addDoc(calleeCandidates,e.candidate.toJSON());};

        await pcRef.current.setRemoteDescription(new RTCSessionDescription(roomSnapshot.data().offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        await updateDoc(roomRef,{answer:{type:answer.type,sdp:answer.sdp}});

        onSnapshot(roomRef,snap=>{
            if(!snap.exists() && !callEndedToastShown.current){
                callEndedToastShown.current = true;
                toast.info("Лікар завершив дзвінок");
                leaveCall();
            }
        });

        setJoined(true);
    };

    const toggleMic = ()=>{
        const stream = localStreamRef.current;
        if(!stream) return;
        const oldTrack = stream.getAudioTracks()[0];
        if(!oldTrack) return;

        const newTrack = oldTrack.clone();
        newTrack.enabled = !mic;
        const sender = pcRef.current?.getSenders().find(s=>s.track&&s.track.kind==="audio");
        if(sender) sender.replaceTrack(newTrack);
        stream.removeTrack(oldTrack);
        stream.addTrack(newTrack);
        setMic(newTrack.enabled);
    };

    const toggleCamera = ()=>{
        const track = localStreamRef.current.getVideoTracks()[0];
        if(!track) return;
        track.enabled = !camera;
        setCamera(track.enabled);
    };

    const leaveCall = ()=>{
        pcRef.current?.close();
        localStreamRef.current?.getTracks().forEach(t=>t.stop());
        if(localVideoRef.current?.srcObject){
            localVideoRef.current.srcObject.getTracks().forEach(t=>t.stop());
            localVideoRef.current.srcObject = null;
        }
        if(remoteVideoRef.current?.srcObject){
            remoteVideoRef.current.srcObject.getTracks().forEach(t=>t.stop());
            remoteVideoRef.current.srcObject = null;
        }
        setJoined(false);
        navigate("/", { replace:true });
    };

    return(
        <div className="video-room">
            <div className={`remote-video-wrapper ${isSpeakingRemote?"speaking":""}`}>
                <video ref={remoteVideoRef} autoPlay playsInline className="remote-video"/>
                <div className="username">Лікар</div>
            </div>

            <div className={`local-video-wrapper ${isSpeakingLocal?"speaking":""}`}>
                <video ref={localVideoRef} autoPlay playsInline muted/>
                <div className="username">Ви</div>
            </div>

            <div className="controls">
                <div className={`control-btn mic ${mic?"":"off"}`} onClick={toggleMic}>{mic?"🎤":"🔇"}</div>
                <div className={`control-btn cam ${camera?"":"off"}`} onClick={toggleCamera}>{camera?"📷":"🚫"}</div>
                <div className="control-btn end" onClick={leaveCall}>📞</div>
            </div>
        </div>
    );
}