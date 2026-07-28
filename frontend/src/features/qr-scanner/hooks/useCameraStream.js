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

function getCameraErrorMessage(error) {
    const technicalErrorName = 
        error?.name || "Unknown error";

    switch (technicalErrorName) {
        case "NotAllowedError":
            return {
                code: "CAMERA_PERMISSION_DENIED",
                message:
                    "Camera access was denied. Please allow camera permissions in your browser settings.",
                retryable: false,
                technicalErrorName,
            };
        
        case "NotFoundError":
            return {
                code: "CAMERA_NOT_FOUND",
                message:
                    "No camera was found on this device. Please ensure a camera is connected and try again.",
                retryable: false,
                technicalErrorName,
            };
        
        case "NotReadableError":
            return {
                code: "CAMERA_NOT_READABLE",
                message:
                    "The camera is currently in use by another application or cannot be accessed. Please close other applications using the camera and try again.",
                retryable: true,
                technicalErrorName,
            };

        case "OverconstrainedError":
            return {
                code: "CAMERA_CONSTRAINTS_NOT_SATISFIED",
                message:
                    "The camera does not support the requested constraints. Please try a different camera or adjust the constraints.",
                retryable: true,
                technicalErrorName,
            };

        case "AbortError":
            return {
                code: "CAMERA_ABORTED",
                message:
                    "The camera request was aborted. Please try again.",
                retryable: true,
                technicalErrorName,
            };
        
        case "InvalidStateError":
            return {
                code: "CAMERA_INVALID_STATE",
                message:
                    "The camera is in an invalid state. Please refresh the page and try again.",
                retryable: true,
                technicalErrorName,
            };
        
        case "SecurityError":
            return {
                code: "CAMERA_SECURITY_ERROR",
                message:
                    "A security error occurred while accessing the camera. Please check your browser settings and try again.",
                retryable: false,
                technicalErrorName,
            };
        
        default:
            return {
                code: "CAMERA_UNKNOWN_ERROR",
                message:
                    "An unknown error occurred while accessing the camera. Please try again.",
                retryable: true,
                technicalErrorName,
            };
    }
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
        setCameraError(null);
        
        console.debug(
            deviceId
                ? "[useCameraStream] Starting camera with deviceId: ${deviceId}"
                : "[useCameraStream] Starting camera with default environment-facing camera"
        );

        let newStream = null;
        
        try{
            if (!window.isSecureContext) {
                const insecureContextError = {
                    code: "CAMERA_INSECURE_CONTEXT",
                    message:
                        "Camera access requires a secure context (HTTPS). Please use a secure connection.",
                    retryable: false,
                    technicalErrorName: "InsecureContextError",
                };
            
                console.error(
                    "[useCameraStream] Insecure context detected. Camera access requires HTTPS.",
                    insecureContextError
                );

                setCameraError(insecureContextError);
                return null;
            }

            if(!navigator.mediaDevices?.getUserMedia) {
                const unsupportedApiError = {
                    code: "CAMERA_UNSUPPORTED_API",
                    message:
                        "Camera access is not supported in this browser. Please use a different browser.",
                    retryable: false,
                    technicalErrorName: "UnsupportedApiError",
                };

                console.error(
                    "[useCameraStream] getUserMedia is not supported in this browser.",
                    unsupportedApiError
                );

                setCameraError(unsupportedApiError);
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

            if (videoTracks.length > 0) {
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

            const mappedError = getCameraErrorMessage(error);

            setCameraError(mappedError);

            console.error(
                "[useCameraStream] Mapped camera error:",
                mappedError
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
