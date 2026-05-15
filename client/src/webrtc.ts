import type { Socket } from 'socket.io-client';

export function createPeerConnection() {
    return new RTCPeerConnection({
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
        ],
    });
}

export async function getLocalMedia(): Promise<MediaStream> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        return stream;
    } catch (error) {
        console.error('Error accessing media devices.', error);
        throw error;
    }
}

export async function createOffer(
    pc: RTCPeerConnection,
    socket: Socket,
    roomId: string
): Promise<void> {
    const offer = await pc.createOffer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: false
    });
    await pc.setLocalDescription(offer);
    socket.emit('offer', { roomId, offer });
}

export async function handleOffer(pc: RTCPeerConnection, offer: RTCSessionDescriptionInit, socket: Socket, roomId: string): Promise<void> { 
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit('answer', { roomId, answer });
 }
export async function handleAnswer(pc: RTCPeerConnection, answer: RTCSessionDescriptionInit): Promise<void> { 
    await pc.setRemoteDescription(new RTCSessionDescription(answer));
 }
export async function handleIceCandidate(pc: RTCPeerConnection, candidate: RTCIceCandidateInit): Promise<void> { 
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
 }