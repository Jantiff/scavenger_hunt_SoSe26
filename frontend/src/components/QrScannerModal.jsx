import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./QrScannerModel.css";

export default function QrScannerModal({ open, onClose, onScanSuccess }) {
    const scannerref = useRef(null);
    const hasScannedRef = useRef(false);
    const [scanErrror, setScanError] = useState("");

    useEffect(() => {
        if (!open) return;

        const readerId = "qr-reader";
        let isMounted = true;
        hasScannedRef.current = false;
        setScanError("");

        const html5QrCode = new Html5Qrcode(readerId);
        scannerRef.current = html5QrCode;

        const startScanner = async () => {
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    async (decodedText) => {
                        if (hasScannedRef.current) return;
                        hasScannedRef.current = true;

                        try {
                            await html5QrCode.stop();
                        } catch (stopError) {
                            console.error("Failed to stop QR code scanner after successful scan:", stopError);
                        }

                        if (isMounted) {
                            onScanSuccess(decodedText);
                        }
                    },
                    () => {
                        // ScanError per Frame - Ignored for now
                    }
                );
            } catch (error) {
                console.error("Error starting QR code scanner:", error);
                if (isMounted) {
                    setScanError("Failed to start QR code scanner. Please ensure camera permissions are granted and try again.");
                }
            }
        };

        startScanner();

        return () => {
            isMounted = false;

            const cleanupScanner = async () => {
                try {
                    if (scannerRef.current) {
                        try {
                            await scannerRef.current.stop();
                        } catch {
                            // Ignore: Scanner might already be stopped or was not activated
                        }

                        try {
                            await scannerRef.current.clear();
                        } catch {
                            // Ignore: Clear might fail if scanner was not fully initialized
                        }
                    }
                } catch (cleanupError) {
                    console.error("Error during QR code scanner cleanup:", cleanupError);
                }
            };

            cleanupScanner();
        };
    }, [open, onScanSuccess]);

    if (!open) return null;

    return (
        <div className="qr-scanner-overlay">
            <div className="qr-scanner-modal">
                <h2>Scan QR Code</h2>
                <div id="qr-reader"></div>
            <div id="qr-reader" className="qr-reader" />

                {scanError && <p className="qr-scanner-error">{scanError}</p>}

                <div className="qr-scanner-actions">
                    <button className="main-button" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
