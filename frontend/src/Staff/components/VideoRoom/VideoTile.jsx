export default function VideoTile({ videoRef, title }) {
    return (
        <div className="video-tile">
            <video ref={videoRef} autoPlay playsInline muted={title === "Ви"} />
            <span>{title}</span>
        </div>
    );
}