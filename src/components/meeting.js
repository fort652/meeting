import { useEffect, useRef, useState } from 'react';

const CameraComponent = () => {
  const videoRef = useRef(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const getCamera = async () => {
      try {
        // Accessing the camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Assigning the stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        setHasError(true);
        console.error("Error accessing the camera", error);
      }
    };

    getCamera();

    // Cleanup function to stop the stream when the component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div>
      {hasError ? (
        <p>There was an error accessing your camera. Please try again later.</p>
      ) : (
        <video ref={videoRef} autoPlay width="100%" />
      )}
    </div>
  );
};

export default CameraComponent;
