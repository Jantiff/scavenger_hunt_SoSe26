import {useRef, useState } from 'react';

// Custom hook to manage camera stream and state
export default function useCameraStream(videoRef) {
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const streamRef = useRef(null);

    return {
        cameras,             // List of available cameras
        selectedCameraId,    // ID of the currently selected camera
        isLoading,           // Indicates if the camera stream is currently loading
        cameraError,         // Error message related to camera access
    }
}


