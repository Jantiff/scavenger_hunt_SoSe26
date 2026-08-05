import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useCameraStream from '../hooks/useCameraStream';
import './QrScannerModal.css';
import useQrScanLoop from '../hooks/useQrScanLoop';
import CameraRetryOverlay from './CameraRetryOverlay';
import CameraUnavailableState from './CameraUnavailableState';
import RoundIconButton from '../../../components/buttons/RoundIconButton';
import decodeQrImageFile from '../utils/decodeQrImageFile';
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
    const { t } = useTranslation();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const galleryInputRef = useRef(null);

    const [isVideoReady, setIsVideoReady] = useState(false);

    const [
        isGalleryProcessing,
        setIsGalleryProcessing,
    ] = useState(false);

    const [galleryError, setGalleryError] = useState("");
    
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
        if(galleryError) {
            return {
                modifier: "qr-scanner-status-error",
                text: galleryError,
            };
        }

        if (isGalleryProcessing) {
            return {
                modifier: "qr-scanner-status-loading",
                text: t("processing_selected_image"),
            };
        }

        if (cameraError) {
            return {
                modifier: "qr-scanner-status-error",
                text: t("camera_unavailable"),
            };
        }

        if (decodedData) {
            return {
                modifier: "qr-scanner-status-success",
                text: t("qr_code_detected"),
            };
        }

        if (isLoading || !isVideoReady) {
            return {
                modifier: "qr-scanner-status-loading",
                text: t("starting_camera"),
            };
        }

        if (isScanning) {
            return {
                modifier: "qr-scanner-status-scanning",
                text: t("scanning_for_qr_codes"),
            };
        }

        return {
            modifier: "qr-scanner-status-ready",
            text: t("position_qr_code"),
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

    const handleSwitchCamera = async () => {
        if (cameras.length < 2  || isLoading) {
            return;
        }

        const currentCameraIndex = cameras.findIndex(
            camera => camera.deviceId === selectedCameraId
        );

        const nextCameraIndex = 
            currentCameraIndex >= 0
                ? (currentCameraIndex + 1) 
                    % cameras.length
                : 0;

        const nextCameraId = 
            cameras[nextCameraIndex]?.deviceId;

        if (!nextCameraId) {
            return;
        }

        setIsVideoReady(false);
        stopScanning();

        await selectCamera(nextCameraId);
    };

    const handleOpenGallery = () => {
        if (isGalleryProcessing) {
            return;
        }

        setGalleryError("");

        galleryInputRef.current?.click();
    };

    const handleGalleryImageChange = async event => {
        const inputElement = event.currentTarget;
        const selectedFile =
            inputElement?.files?.[0];

        if (!selectedFile) {
            return;
        }

        setGalleryError("");
        setIsGalleryProcessing(true);

        stopScanning();

        try {
            const decodedValue = 
                await decodeQrImageFile(
                    selectedFile,
                    canvasRef.current
                );
            
            if (!decodedValue) {
                setGalleryError(
                    t("qr_code_not_found_in_image")
                );
            
                if ( 
                    isVideoReady &&
                    !cameraError
                ) {
                    startScanning();
                }

                return;
            }

            if (
                typeof onScanSuccess !== "function"
            ) {
                throw new Error(
                    t("scan_result_processing_failed")
                );
            }

            console.info(
                "[QrScannerModal] QR code detected in gallery image:",
                decodedValue
            );

            stopCamera();

            await onScanSuccess(decodedValue);
        } catch (error) {
            console.error(
                "[QrScannerModal] Failed to scan gallery image:",
                error
            );

            setGalleryError(
                error instanceof Error
                    ? error.message
                    : t("selected_image_scan_failed")
            );

            if (
                isVideoReady &&
                !cameraError
            ) {
                startScanning();
            }
        } finally {
            setIsGalleryProcessing(false);
            inputElement.value = "";
        }
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
                            {t("scan_qr_code")}
                        </h2>
                        <p>
                            {t("align_qr_code")}
                        </p>
                    </div>
                    <RoundIconButton
                        size="small"
                        className="qr-scanner-icon-button"
                        onClick={handleClose}
                        ariaLabel={t("close_qr_scanner")}
                    >
                        <FaTimes aria-hidden="true" />
                    </RoundIconButton>
                </div>
                <div
                    className={`qr-scanner-status-bar ${scannerStatus.modifier}`}
                    role="status"
                    aria-live="polite"
                >
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
                    <RoundIconButton
                        size="medium"
                        onClick={handleOpenGallery}
                        disabled={isGalleryProcessing}
                        ariaLabel={t("choose_image_from_gallery")}
                    >
                        <FaImage aria-hidden="true" />
                    </RoundIconButton>
                    <RoundIconButton
                        size="medium"
                        onClick={handleSwitchCamera}
                        disabled={
                            cameras.length < 2 || isLoading
                        }
                        ariaLabel={t("switch_camera")}
                    >
                        <FaSyncAlt aria-hidden="true" />
                    </RoundIconButton>
                </div>
                <input
                    ref={galleryInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleGalleryImageChange}
                />
                <canvas
                    ref={canvasRef}
                    hidden
                />
            </div>
        </div>
    );
}   
