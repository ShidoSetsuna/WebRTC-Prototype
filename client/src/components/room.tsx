import { useEffect, useRef } from 'react';
import { socket } from '../socket';

import { 
    createPeerConnection, 
    getLocalMedia, 
    createOffer, 
    handleOffer, 
    handleAnswer, 
    handleIceCandidate  
} from '../webrtc';

type RoomProps = {
    roomId: string;
    sharableLink: string | null;
}

export default function Room( { roomId, sharableLink }: RoomProps ) {
    const pcRef = useRef<RTCPeerConnection | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const localMediaReady = useRef(false);
    const pendingOffer = useRef<RTCSessionDescriptionInit | null>(null);
    
    useEffect(() => {
        const pc = createPeerConnection();
        pcRef.current = pc;

        console.log('Initial pc state:', pc.connectionState, pc.signalingState);

        pc.onconnectionstatechange = () => {
            console.log('Connection state changed to:', pc.connectionState);
        };
        pc.onsignalingstatechange = () => {
            console.log('Signaling state changed to:', pc.signalingState);
        };
        pc.oniceconnectionstatechange = () => {
            console.log('ICE state changed to:', pc.iceConnectionState);
        };

        let localStream: MediaStream | null = null;

        pc.ontrack = (event) => {
            console.log('Received remote track', event);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
                console.log('Set remote video source', event.streams[0]);
            } else {
                console.error('Remote video element not found');
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { roomId, candidate: event.candidate });
            }
        };

        socket.on('peer-joined', () => {
            console.log('peer-joined handler. State:', 
                pcRef.current?.connectionState, 
                pcRef.current?.signalingState
            );
            if (pcRef.current) {
                createOffer(pcRef.current, socket, roomId);
            }
        });

        socket.on('offer', async ({ offer }) => {
            if (pcRef.current && localMediaReady.current) {
                await handleOffer(pcRef.current, offer, socket, roomId);
            } else {
                pendingOffer.current = offer;
            }
        });

        socket.on('answer', ({ answer }) => {
            if (pcRef.current) {
                handleAnswer(pcRef.current, answer);
            }
        });

        socket.on('ice-candidate', ({ candidate }) => {
            if (pcRef.current) {
                handleIceCandidate(pcRef.current, candidate);
            }
        });

        getLocalMedia().then(async stream => {
            localStream = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
            localMediaReady.current = true;
            
            if (pendingOffer.current && pcRef.current) {
                await handleOffer(pcRef.current, pendingOffer.current, socket, roomId);
                pendingOffer.current = null;
            }
        });
                
        return () => {
            socket.off('peer-joined');
            socket.off('offer');
            socket.off('answer');
            socket.off('ice-candidate');
            pc.close();
            pcRef.current = null;
            localStream?.getTracks().forEach(track => track.stop());
        };
    }, [roomId]);

    return (
        <section>
            <p>Room ID: {roomId}</p>
            {sharableLink && (
                <button onClick={() => navigator.clipboard.writeText(sharableLink)}>
                Copy Sharable Link
                </button>
            )}
            <p>Current peers: </p>
            <video ref={localVideoRef} autoPlay muted style={{ width: '300px' }} />
            <video ref={remoteVideoRef} autoPlay style={{ width: '300px' }} />
        </section>
    )
}