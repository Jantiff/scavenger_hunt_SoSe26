import { useCallback, useEffect, useRef, useState } from 'react';

// Function to create media constraints for the camera stream based on the provided deviceId
function createCameraConstraints(deviceId) {
    if (deviceId) {
        return {
            audio: false,
            video: {
                deviceId: {
                    exact: deviceId,
                },
            },
        };
    } 

    return {
        audio: false,
        video: {
            facingMode: { ideal: "environment"},    // Default to the environment-facing camera
            width: { ideal: 1280 },                 // Ideal width for the video stream
            height: { ideal: 720 },                 // Ideal height for the video stream
        },
    };
}


// Custom hook to manage camera stream for QR code scanning
export default function useCameraStream(videoRef) {
    const [cameras, setCameras] = useState([]);
    const [selectedCameraId, setSelectedCameraId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);

    const streamRef = useRef(null);

    // Function to stop the camera stream and clean up resources
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

    // Function to start the camera stream with the specified deviceId or default camera
    const startCamera = useCallback(async (deviceId) => {
        setIsLoading(true);
        
        console.debug(
            deviceId
                ? "[useCameraStream] Starting camera with deviceId: ${deviceId}"
                : "[useCameraStream] Starting camera with default environment-facing camera"
        );

        let newStream = null;
        
        try{
            if(!navigator.mediaDevices?.getUserMedia) {
                console.error(
                    "[useCameraStream] getUserMedia is not supported in this browser."
                );

                return null;
            }   

            const videoElement = videoRef.current;

            if (!videoElement) {
                console.error(
                    "[useCameraStream] Video element reference is null. Cannot start camera."
                );
                return null;
            }

            stopCamera(); 

            const constraints = createCameraConstraints(deviceId);

            newStream = await navigator.mediaDevices.getUserMedia(constraints);

            streamRef.current = newStream;
            videoElement.srcObject = newStream;

            await videoElement.play();

            console.debug(
                "[useCameraStream] Camera stream started successfully."
            );

            const videoTracks = newStream.getVideoTracks();

            if (videoTracks) {
                const settings = videoTracks[0].getSettings();

                console.debug(
                    "[useCameraStream] Video track settings:",
                    settings
                );

                setSelectedCameraId(settings.deviceId || deviceId || "");
            } else {
                console.warn(
                    "[useCameraStream] No video tracks found in the stream."
                );
            }

            await loadCameras();

            return newStream;
        } catch (error) {

            console.error(
                "[useCameraStream] Error occurred while starting camera stream:",
                error
            );

            if (newStream) {
                newStream.getTracks().forEach((track) => track.stop());
            }

            if (streamRef.current === newStream) {
                streamRef.current = null;
            }
            
            if (videoRef.current?.srcObject === newStream) {
                videoRef.current.srcObject = null;
            }

            return null;
        } finally {
            setIsLoading(false);
            
            console.debug(
                "[useCameraStream] Camera start process completed. isLoading set to false."
            );
        }
    }, [videoRef, stopCamera, loadCameras]);

    // Function to select a specific camera by its deviceId
    const selectCamera = useCallback(async (deviceId) => {
        if (!deviceId) {
            console.warn(
                "[useCameraStream] No deviceId provided for camera selection."
            );
            
            return null;
        }

        console.debug(
            "[useCameraStream] Selecting camera with deviceId: ${deviceId}"
        );
        
        return startCamera(deviceId);
    }, [startCamera]);

    // Return the state and functions related to camera stream management
    return {
        cameras,             // List of available cameras
        selectedCameraId,    // ID of the currently selected camera
        isLoading,           // Indicates if the camera stream is currently loading
        cameraError,         // Error message related to camera access
        stopCamera,          // Function to stop the camera stream
        loadCameras,         // Function to load available cameras
        selectCamera,        // Function to select a specific camera by deviceId
        startCamera,         // Function to start the camera stream
    }
}
