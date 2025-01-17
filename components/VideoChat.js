// components/VideoChat.js
import { useState, useEffect, useRef } from 'react';

const VideoChat = () => {
  const [socket, setSocket] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Create WebSocket connection to signaling server
  useEffect(() => {
    const socket = new WebSocket('ws://192.168.x.x:3000/api/socket'); // Replace with your computer's local IP
    setSocket(socket);

    socket.onopen = () => {
      console.log('Connected to signaling server');
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleSignalingMessage(message);
    };

    // Cleanup WebSocket connection on unmount
    return () => {
      socket.close();
    };
  }, []);

  // Initialize WebRTC Peer Connection
  useEffect(() => {
    if (socket && !peerConnection) {
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      setPeerConnection(peer);

      // Get local video stream
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          setLocalStream(stream);
          localVideoRef.current.srcObject = stream;

          stream.getTracks().forEach((track) => {
            peer.addTrack(track, stream);
          });
        })
        .catch((error) => console.error('Error accessing media devices:', error));

      // Handle remote video stream
      peer.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      // Handle ICE candidates
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          const message = {
            type: 'candidate',
            candidate: event.candidate,
          };
          socket.send(JSON.stringify(message));
        }
      };
    }
  }, [socket, peerConnection]);

  // Handle incoming signaling messages (offer, answer, candidate)
  const handleSignalingMessage = (message) => {
    switch (message.type) {
      case 'offer':
        handleOffer(message);
        break;
      case 'answer':
        handleAnswer(message);
        break;
      case 'candidate':
        handleCandidate(message);
        break;
      default:
        break;
    }
  };

  const handleOffer = (offer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    peerConnection
      .createAnswer()
      .then((answer) => peerConnection.setLocalDescription(answer))
      .then(() => {
        const message = {
          type: 'answer',
          answer: peerConnection.localDescription,
        };
        socket.send(JSON.stringify(message));
      })
      .catch((err) => console.error('Error creating answer:', err));
  };

  const handleAnswer = (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleCandidate = (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const createOffer = () => {
    peerConnection
      .createOffer()
      .then((offer) => peerConnection.setLocalDescription(offer))
      .then(() => {
        const message = {
          type: 'offer',
          offer: peerConnection.localDescription,
        };
        socket.send(JSON.stringify(message));
      })
      .catch((err) => console.error('Error creating offer:', err));
  };

  return (
    <div>
      <h1>Video Chat</h1>
      <div>
        <video ref={localVideoRef} autoPlay muted width="300" />
        <video ref={remoteVideoRef} autoPlay width="300" />
      </div>
      <button onClick={createOffer}>Start Video Call</button>
    </div>
  );
};

export default VideoChat;
