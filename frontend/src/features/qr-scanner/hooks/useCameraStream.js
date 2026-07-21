import { useCallback, useRef, useState } from 'react';

// Custom hook to manage camera stream for QR code scanning
export default function useCameraStream(videoRef) {
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const streamRef = useRef(null);

    // Function to stop the camera stream and clean up resources
    // This function stops all tracks of the current media stream and clears the video element's source.
    const stopCamera = useCallback(() => {
        const currentStream = streamRef.current;

        if (currentStream) {
            const tracks = currentStream.getTracks();
            
            console.debug(
                "[useCameraStream] Stopping camera stream with ${tracks.length} tracks"
            );

            tracks.forEach((track) => {
                console.debug(
                    "[useCameraStream] Stopping track: ${track.label} (${track.kind}) Current state: ${track.readyState}"
                );

                track.stop();
            });

            streamRef.current = null;
        } else {
            console.debug(
                "[useCameraStream] No active camera stream to stop."
            );
        }

        const videoElement = videoRef.current;

        if (videoElement) {
            videoElement.pause();
            videoElement.srcObject = null;
            
            console.debug(
                "[useCameraStream] Video element paused and srcObject cleared."
            );
        } else {
            console.warn(
                "[useCameraStream] Video element reference is null. Cannot pause or clear srcObject."
            );
        }
    }, [videoRef]);

    // Function to load available cameras using the MediaDevices API
    const loadCameras = useCallback(async () => {
        if (!navigator.mediaDevices?.enumerateDevices) {
            console.warn(
                "[useCameraStream] enumerateDevices is not supported in this browser."
            );

            setCameras([]);
            return;
        }

        try {
            console.debug(
                "[useCameraStream] Loading available cameras..."
            );

            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(
                (device) => device.kind === "videoinput"
            );

            setCameras(videoDevices);
            console.debug(
                "[useCameraStream] Found ${videoDevices.length} video input devices.",
                videoDevices
            );
            
            return videoDevices;

        } catch (error) {
            console.error(
                "[useCameraStream] Error occurred while loading cameras:",
                error
            );

            setCameras([]);
            return [];
        }
    }, []);

    // Return the state and functions related to camera stream management
    return {
        cameras,             // List of available cameras
        selectedCameraId,    // ID of the currently selected camera
        isLoading,           // Indicates if the camera stream is currently loading
        cameraError,         // Error message related to camera access
    }
}
