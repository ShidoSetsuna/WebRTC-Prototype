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
    
    useEffect(() => {
        const pc = createPeerConnection();
        pcRef.current = pc;

        let localStream: MediaStream | null = null;

        getLocalMedia().then(stream => {
            localStream = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
        });

        pc.ontrack = (event) => {
            console.log('Received remote track', event);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { roomId, candidate: event.candidate });
            }
        };

        socket.on('peer-joined', () => {
        if (pcRef.current) {
            createOffer(pcRef.current, socket, roomId);
        }
        });

        socket.on('offer', ({ offer }) => {
        if (pcRef.current) {
            handleOffer(pcRef.current, offer, socket, roomId);
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