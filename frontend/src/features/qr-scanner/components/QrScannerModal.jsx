import { useEffect, useRef, useState } from 'react';
import useCameraStream from '../hooks/useCameraStream';
import './QrScannerModal.css';
import useQrScanLoop from '../hooks/useQrScanLoop';

export default function QrScannerModal({ 
    isOpen,
    onClose,
    onScanSuccess,
}) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [isVideoReady, setIsVideoReady] = useState(false);
    
    const {
        isScanning,
        decodedData,
        startScanning,
        stopScanning
    } = useQrScanLoop({
        videoRef,
        canvasRef,
    });

    const {
        cameras,
        selectedCameraId,
        isLoading,
        cameraError,
        stopCamera,
        selectCamera,
        startCamera,
    } = useCameraStream(videoRef);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        console.debug(
            "[QrScannerModal] Modal opened. Starting camera stream."
        );

        setIsVideoReady(false);
        startCamera();

        return () => {
            console.debug(
                "[QrScannerModal] Modal closed. Stopping camera stream."
            );
            
            stopCamera();
        };
    }, [isOpen, startCamera, stopCamera]);

    useEffect(() => {
        if (!isOpen || !isVideoReady) {
            return;
        }

        console.debug(
            "[QrScannerModal] Video is ready. Starting QR scanning loop."
        );

        startScanning();

        return () => {
            stopScanning();
        };
    }, [isOpen, isVideoReady, startScanning, stopScanning]);

    useEffect(() => {
        if (!isOpen || !decodedData) {
            return;
        }

        console.info(
            "[QrScannerModal] Forwarding decoded Qr data:",
            decodedData
        );

        stopScanning();
        stopCamera();

        if (typeof onScanSuccess === 'function') {
            onScanSuccess(decodedData);
        } else {
            console.warn(
                "[QrScannerModal] No onScanSuccess callback was provided."
            );
        }
    }, [isOpen,
        decodedData,
        onScanSuccess,
        stopScanning,
        stopCamera,
    ]);

    if (!isOpen) {
        return null;
    }

    const handleClose = () => {
        console.debug(
            "[QrScannerModal] Close button clicked. Closing modal."
        );
        
        stopScanning();
        stopCamera();
        onClose();
    };

    return (
        <div className="qr-scanner-overlay">
            <div
                className="qr-scanner-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="qr-scanner-title"
            >
                <h2 id="qr-scanner-title">
                    QR Code Scanner
                </h2>
                {isLoading && (
                    <p className="qr-scanner-status">
                        Loading camera...
                    </p>
                )}
                
                {cameraError && (
                    <div
                        className="qr-scanner-error"
                        role="alert"
                    >
                        <strong>Camera Error</strong>
                        <p>{cameraError.message}</p>
                        <small>
                            Error Code: {cameraError.code}
                        </small>
                    </div>
                )}
                <div className="qr-scanner-video-container">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`qr-scanner-video ${
                            isVideoReady ? "qr-scanner-video-ready" : ""
                        }`}
                        onLoadedMetadata={() => {
                            const videoElement = videoRef.current;
                            console.debug(
                                "[QrScannerModal] Video metadata loaded:",
                                {
                                    width: videoElement.videoWidth,
                                    height: videoElement.videoHeight,
                                }
                            );
                        }}
                        onCanPlay={() => {
                            const videoElement = videoRef.current;
                            if(
                                videoElement &&
                                videoElement.videoWidth > 0 &&
                                videoElement.videoHeight > 0
                            ) {
                                console.debug(
                                    "[QrScannerModal] Video can play. Video dimensions:",
                                    videoElement.videoWidth,
                                    videoElement.videoHeight
                                );
                            setIsVideoReady(true);
                            }
                        }}
                    />
                </div>
                <canvas
                    ref={canvasRef}
                    hidden
                />
                {isScanning && (
                    <p className="qr-scanner-status">
                        Scanning for QR codes...
                    </p>
                )}
                {decodedData && (
                    <p className="qr-scanner-status">
                        Qr code detected: {decodedData}
                    </p>
                )}
                {cameras.length > 1 && (
                    <label className="qr-scanner-camera-selection">
                        Select Camera:
                        <select
                            value={selectedCameraId}
                            onChange={(event) =>
                                selectCamera(event.target.value)
                            }
                            disabled={isLoading}
                        >
                            {cameras.map((camera, index) => (
                                <option
                                    key={camera.deviceId}
                                    value={camera.deviceId}
                                >
                                    {camera.label || `Camera ${index + 1}`}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <button
                    type="button"
                    className="qr-scanner-close-button"
                    onClick={handleClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}   
