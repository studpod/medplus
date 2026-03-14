import { useEffect, useRef } from "react";
import { db } from "../firebase";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    addDoc,
    onSnapshot
} from "firebase/firestore";

export default function VideoCall({ roomId }) {
    const localVideo = useRef(null);
    const remoteVideo = useRef(null);
    const pc = useRef(null);

    useEffect(() => {
        const startCall = async () => {
            const servers = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
            pc.current = new RTCPeerConnection(servers);

            // Remote stream
            const remoteStream = new MediaStream();
            remoteVideo.current.srcObject = remoteStream;

            // Local stream
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.current.srcObject = localStream;
            localStream.getTracks().forEach(track => pc.current.addTrack(track, localStream));

            pc.current.ontrack = e => e.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));

            const roomRef = doc(db, "calls", roomId);
            const callerCandidates = collection(roomRef, "callerCandidates");
            const calleeCandidates = collection(roomRef, "calleeCandidates");

            const roomSnapshot = await getDoc(roomRef);

            if (!roomSnapshot.exists()) {
                // --- Caller ---
                const offer = await pc.current.createOffer();
                await pc.current.setLocalDescription(offer);
                await setDoc(roomRef, { offer });

                pc.current.onicecandidate = async e => {
                    if (e.candidate) await addDoc(callerCandidates, e.candidate.toJSON());
                };

                // Listen for answer
                onSnapshot(roomRef, async snapshot => {
                    const data = snapshot.data();
                    if (data?.answer && !pc.current.currentRemoteDescription) {
                        await pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                    }
                });

                // Listen for callee ICE
                onSnapshot(calleeCandidates, snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === "added") {
                            pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                        }
                    });
                });

            } else {
                // --- Callee ---
                const data = roomSnapshot.data();

                // 1️⃣ Set remote offer
                if (!pc.current.currentRemoteDescription) {
                    await pc.current.setRemoteDescription(new RTCSessionDescription(data.offer));

                    // 2️⃣ Create answer
                    const answer = await pc.current.createAnswer();
                    await pc.current.setLocalDescription(answer);

                    // 3️⃣ Write answer to Firestore (if not exists)
                    if (!data.answer) await updateDoc(roomRef, { answer });
                }

                // ICE candidates
                pc.current.onicecandidate = async e => {
                    if (e.candidate) await addDoc(calleeCandidates, e.candidate.toJSON());
                };

                // Listen for caller ICE
                onSnapshot(callerCandidates, snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === "added") {
                            pc.current.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                        }
                    });
                });
            }
        };

        startCall();
    }, [roomId]);

    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "40px" }}>
            <video ref={localVideo} autoPlay playsInline muted style={{ width: "400px", borderRadius: "10px", border: "2px solid #ccc" }} />
            <video ref={remoteVideo} autoPlay playsInline style={{ width: "400px", borderRadius: "10px", border: "2px solid #ccc" }} />
        </div>
    );
}