import React, { useEffect, useState, useRef } from "react";
import Peer from "peerjs";

export default function HomePage() {
  const [peerId, setPeerId] = useState("");
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [peer, setPeer] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize Peer on mount
  useEffect(() => {
    const newPeer = new Peer();
    newPeer.on("open", (id) => {
      setPeerId(id);
      console.log("My peer ID is: " + id);
    });

    // When somebody calls you:
    newPeer.on("call", (call) => {
      // Get your media stream and answer the call
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((mediaStream) => {
          setStream(mediaStream);
          call.answer(mediaStream);

          // Listen for remote stream
          call.on("stream", (remoteStream) => {
            setRemoteStream(remoteStream);
          });
        })
        .catch((err) => console.error("Failed to get local stream", err));
    });

    setPeer(newPeer);
  }, []);

  // Attach local stream to local video ref
  useEffect(() => {
    if (localVideoRef.current && stream) {
      localVideoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Attach remote stream to remote video ref
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Function to initiate a call to another peer
  const callPeer = () => {
    if (!peer || !remotePeerIdValue) return;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        const call = peer.call(remotePeerIdValue, mediaStream);
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
        });
      })
      .catch((err) => console.error("Failed to get local stream", err));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Next.js Video Call App</h1>
      <p>
        <strong>Your Peer ID:</strong> {peerId}
      </p>
      <div style={{ marginTop: 20, marginBottom: 10 }}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "300px",
            height: "200px",
            backgroundColor: "black",
            marginRight: 20,
          }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{ width: "300px", height: "200px", backgroundColor: "black" }}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <input
          type="text"
          placeholder="Enter friend's Peer ID"
          value={remotePeerIdValue}
          onChange={(e) => setRemotePeerIdValue(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button onClick={callPeer}>Call</button>
      </div>
      <p style={{ marginTop: 20 }}>
        Share your Peer ID with a friend. When they enter your Peer ID and click
        "Call," you should see each other's video feeds.
      </p>
    </div>
  );
}
