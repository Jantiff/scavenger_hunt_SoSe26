import { useEffect, useRef, useState } from 'react';
import useCameraStream from '../hooks/useCameraStream';
import './QrScannerModal.css';
import useQrScanLoop from '../hooks/useQrScanLoop';
import CameraRetryOverlay from './CameraRetryOverlay';
import CameraUnavailableState from './CameraUnavailableState';
import {
    FaImage,
    FaTimes,
    FaSyncAlt,
} from 'react-icons/fa';

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

    const hasRetryableCameraError =
        cameraError?.retryable === true;
    const hasBlockingCameraError =
        cameraError?.retryable === false;

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
        if (
            !isOpen || 
            !isVideoReady ||
            isLoading ||
            cameraError
) {
            return;
        }

        console.debug(
            "[QrScannerModal] Video is ready. Starting QR scanning loop."
        );

        startScanning();

        return () => {
            stopScanning();
        };
    }, [
        isOpen,
        isVideoReady,
        startScanning,
        stopScanning,
        isLoading,
        cameraError,
    ]);

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
    }, [
        isOpen,
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

    const getScannerStatus = () => {
        if (cameraError) {
            return {
                modifier: "qr-scanner-status-error",
                text: "Camera unavailable.",
            };
        }

        if (decodedData) {
            return {
                modifier: "qr-scanner-status-success",
                text: "QR code detected.",
            };
        }

        if (isLoading || !isVideoReady) {
            return {
                modifier: "qr-scanner-status-loading",
                text: "Starting camera...",
            };
        }

        if (isScanning) {
            return {
                modifier: "qr-scanner-status-scanning",
                text: "Scanning for QR codes...",
            };
        }

        return {
            modifier: "qr-scanner-status-ready",
            text: "Position the QR code within the frame.",
        };
    };

    const scannerStatus = getScannerStatus();

    const handleRetryCamera = async () => {
        console.debug(
            "[QrScannerModal] Retrying camera start."
        );

        setIsVideoReady(false);
        stopScanning();

        await startCamera(
            selectedCameraId || undefined
        );
    };

    return (
        <div className="qr-scanner-overlay">
            <div
                className="qr-scanner-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="qr-scanner-title"
            >
                <div className="qr-scanner-header">
                    <div className="qr-scanner-header-text">
                        <h2 id="qr-scanner-title">
                            Scan QR Code
                        </h2>
                        <p>
                            Align the QR code inside the frame.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="qr-scanner-icon-button"
                        onClick={handleClose}
                        aria-label="Close QR Scanner"
                    >
                        <FaTimes aria-hidden="true" />
                    </button>
                </div>
                <div
                    className={`qr-scanner-status-bar ${scannerStatus.modifier}`}
                    role="status"
                    aria-live="polite"
                >
                    <span 
                        className="qr-scanner-status-dot"
                        aria-hidden="true"
                    />
                    <span>{scannerStatus.text}</span>
                </div>
                {hasBlockingCameraError ? (
                    <CameraUnavailableState
                        error={cameraError}
                        onClose={handleClose}
                    />
                ) : (
                    <div className="qr-scanner-video-container">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="qr-scanner-video"
                            onLoadedMetadata={() => {
                                const videoElement = videoRef.current;
                                if (!videoElement) {
                                    return;
                                }
                                console.debug(
                                    "[QrScannerModal] Video metadata loaded:",
                                    {
                                        videoWidth: videoElement.videoWidth,
                                        videoHeight: videoElement.videoHeight,
                                    }
                                );
                            }}
                            onCanPlay={() => {
                                const videoElement = videoRef.current;
                                if (
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
                        <div className="qr-scanner-scan-overlay"
                            aria-hidden="true"
                        >
                            <div className="qr-scanner-scan-frame" >
                                <span className="qr-scanner-corner qr-scanner-corner-top-left" />
                                <span className="qr-scanner-corner qr-scanner-corner-top-right" />
                                <span className="qr-scanner-corner qr-scanner-corner-bottom-left" />
                                <span className="qr-scanner-corner qr-scanner-corner-bottom-right" />
                            </div>
                        </div>
                        {hasRetryableCameraError && (
                            <CameraRetryOverlay
                                error={cameraError}
                                onRetry={handleRetryCamera}
                                isLoading={isLoading}
                                onClose={handleClose}
                            />
                        )}
                    </div>
                )}
                <div className="qr-scanner-actions">
                    <button
                        type="button"
                        className="qr-scanner-action-button"
                        aria-label="Choose an image from the gallery"
                    >
                        <FaImage aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        className="qr-scanner-action-button"
                        aria-label="Switch camera"
                    >
                        <FaSyncAlt aria-hidden="true" />
                    </button>
                </div>
                <canvas
                    ref={canvasRef}
                    hidden
                />
                {cameras.length > 1 && (
                    <label className="qr-scanner-selection">
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
            </div>
        </div>
    );
}   
