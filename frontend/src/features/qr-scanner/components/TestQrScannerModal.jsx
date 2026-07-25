import { useEffect, useRef, useState } from 'react';
import useCameraStream from '../hooks/useCameraStream';
import './TestQrScannerModal.css';
import useQrScanLoop from '../hooks/useQrScanLoop';

export default function QrScannerModal({ 
    isOpen, onClose 
}) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [isVideoReady, setIsVideoReady] = useState(false);
    
    const {
        isScanning,
        decodeCurrentFrame,
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
            "[TestQrScannerModal] Modal opened. Starting camera stream."
        );

        setIsVideoReady(false);
        startCamera();

        return () => {
            console.debug(
                "[TestQrScannerModal] Modal closed. Stopping camera stream."
            );
            
            stopCamera();
        };
    }, [isOpen, startCamera, stopCamera]);

    useEffect(() => {
        if (!isOpen || !isVideoReady) {
            return;
        }

        console.debug(
            "[TestQrScannerModal] Video is ready. Starting QR scanning loop."
        );

        startScanning();

        return () => {
            stopScanning();
        };
    }, [isOpen, isVideoReady, startScanning, stopScanning]);

    if (!isOpen) {
        return null;
    }

    const handleClose = () => {
        console.debug(
            "[TestQrScannerModal] Close button clicked. Closing modal."
        );

        stopCamera();
        onClose();
    };

    const handleQrTest = () => {
        console.debug(
            "[TestQrScannerModal] Test QR code button clicked."
        );

        const decodedData = decodeCurrentFrame();

        if (!decodedData) {
            console.warn(
                "[TestQrScannerModal] No QR code data returned from decodeCurrentFrame."
            );
            return;
        }

        console.debug(
            "[TestQrScannerModal] QR code data decoded:",
            decodedData
        );
    }

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
                    <p className="qr-scanner-status">
                        Error: {cameraError}
                    </p>
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
                                "[TestQrScannerModal] Video metadata loaded:",
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
                                    "[TestQrScannerModal] Video can play. Video dimensions:",
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
                <button
                    type="button"
                    className="main-button main-button-blue"
                    onClick={handleQrTest}
                >
                    Test QR Code    
                </button>
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
