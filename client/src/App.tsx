import { useState, useEffect } from 'react';
import { socket } from './socket';

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [sharableLink, setSharableLink] = useState<string | null>(null);

  useEffect(() => {
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('room-created', (id) => {
      setRoomId(id);
      setSharableLink(`${window.location.origin}?room=${id}`);
      window.history.replaceState({}, '', `?room=${id}`);
    });
    
    socket.on('peer-joined', (peerId) => {
      console.log('Peer joined:', peerId);
    });
    
    socket.on('room-not-found', () => {
      console.error('Room not found');
    });

    // Check for room ID in url and attempt to join if it exists
    const params = new URLSearchParams(window.location.search);
    const existingRoomId = params.get('room');
    if (existingRoomId) {
      socket.emit('join-room', existingRoomId);
      setRoomId(existingRoomId);
    }

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-created');
      socket.off('peer-joined');
      socket.off('room-not-found');
    };
  }, []);

  const handleCreateRoom = () => {
    socket.emit('create-room');
  };

  return (
    <>
      <h1>{isConnected ? 'Connected' : 'Disconnected'}</h1>
      {!roomId && (
        <button onClick={handleCreateRoom}>Create Room</button>
      )}
      {roomId && (
        <section>
          <p>Room ID: {roomId}</p>
          {sharableLink && (
            <button onClick={() => navigator.clipboard.writeText(sharableLink)}>
              Copy Sharable Link
            </button>
          )}
        </section>
      )}
    </>
  );
}

export default App