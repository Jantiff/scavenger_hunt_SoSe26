import AppButton from "../../../components/buttons/AppButton";
import "./CameraErrorStates.css";

export default function CameraRetryOverlay({
    error,
    onRetry,
    isLoading,
    onClose,
}) {
    if (!error) {
        return null;
    }
    
    return (
        <div
            className="qr-camera-retry-overlay"
            role="alert"
            aria-modal="true"
            aria-labelledby="qr-camera-retry-title"
            aria-describedby="qr-camera-retry-message"
        >
            <div className="qr-camera-error-card">
                <h3 id="qr-camera-retry-title">
                    Camera problem
                </h3>
                <p id="qr-camera-retry-message">
                    {error.message}
                </p>
                <div className="qr-camera-error-actions">
                    <AppButton
                        type="button"
                        variant="green"
                        className="qr-camera-error-button"
                        onClick={onRetry}
                        disabled={isLoading}
                        aria-busy={isLoading}
                    >
                        {isLoading ? "Retrying..." : "Retry"}
                    </AppButton>
                    <AppButton
                        type="button"
                        variant="neutral"
                        className="qr-camera-error-button"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Close
                    </AppButton>
                </div>
            </div>
        </div>
    );
}