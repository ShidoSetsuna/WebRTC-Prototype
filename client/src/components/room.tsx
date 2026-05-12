type RoomProps = {
    roomId: string;
    sharableLink: string | null;
}

export default function Room( { roomId, sharableLink }: RoomProps ) {

    return (
        <section>
            <p>Room ID: {roomId}</p>
            {sharableLink && (
                <button onClick={() => navigator.clipboard.writeText(sharableLink)}>
                Copy Sharable Link
                </button>
            )}
        </section>
    )
}