import { useEffect, useRef } from 'react';
import useCameraStream from '../hooks/useCameraStream';
import './TestQrScannerModal.css';

export default function QrScannerModal({ 
    isOpen, onClose 
}) {
    const videoRef = useRef(null);
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

        startCamera();

        return () => {
            console.debug(
                "[QrScannerModal] Modal closed. Stopping camera stream."
            );
            
            stopCamera();
        };
    }, [isOpen, startCamera, stopCamera]);

    if (!isOpen) {
        return null;
    }

    const handleClose = () => {
        console.debug(
            "[QrScannerModal] Close button clicked. Closing modal."
        );

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
                        className="qr-scanner-video"
                    />
                </div>

                {cameras.length > 1 && (
                    <label className="qr-scanner-camera-slection">
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
