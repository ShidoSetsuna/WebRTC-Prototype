# WebRTC Prototype

A minimal two-peer video chat application built to demonstrate WebRTC's peer-to-peer architecture. School project for Faglig Fornyelse, May 2026.

## What it does

- Two users join a shared room via URL
- Each user's webcam streams directly to the other (peer-to-peer)
- The signaling server only relays connection setup messages, it never handles video data

## Stack

**Client:** React + TypeScript + Vite, Socket.IO client
**Server:** Node.js + Express + Socket.IO, TypeScript
**Infrastructure:** DigitalOcean VPS, Nginx reverse proxy, Let's Encrypt HTTPS, PM2, Vercel

## Live Demo

- **Client:** https://webrtc-prototype-liart.vercel.app
- **Signaling server:** https://webrtc.shiso.app

## Running Locally

### Server

```bash
cd server
npm install
echo "PORT=2424" > .env
npm run server
```

### Client

```bash
cd client
npm install
echo "VITE_SERVER_URL=http://localhost:2424" > .env
npm run dev
```

Open `http://localhost:5173` in two browsers (different cameras required for full two-way video).

## How it Works

1. Both peers connect to the signaling server and join a room
2. When peer 2 joins, peer 1 creates an SDP offer
3. Offer is relayed through the server to peer 2
4. Peer 2 responds with an SDP answer
5. Both peers exchange ICE candidates through the server
6. Direct peer-to-peer connection establishes
7. Media flows directly between browsers; the server is no longer involved

## Limitations

- Two peers maximum (mesh topology, not SFU)
- Both peers must grant camera permission
- No audio (video only)
- No persistent rooms across server restarts

## License

MIT
