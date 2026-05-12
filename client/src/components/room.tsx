import { useEffect, useRef } from 'react';
import { createPeerConnection } from '../webrtc';
import { socket } from '../socket';

type RoomProps = {
    roomId: string;
    sharableLink: string | null;
}

export default function Room( { roomId, sharableLink }: RoomProps ) {
    const pcRef = useRef<RTCPeerConnection | null>(null);
    
    useEffect(() => {
        const pc = createPeerConnection();
        pcRef.current = pc;

        pc.ontrack = (event) => {
        console.log('Received remote track', event);
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { roomId, candidate: event.candidate });
            }
        };
                
        return () => {
            pc.close();
            pcRef.current = null;
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
        </section>
    )
}