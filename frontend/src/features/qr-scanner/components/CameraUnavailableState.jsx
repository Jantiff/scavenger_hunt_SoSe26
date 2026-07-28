import "./CameraErrorStates.css";

export default function CameraUnavailableState({
    onClose,
    error,
}) {
    if (!error) {
        return null;
    }

    return (
        <div
            className="qr-camera-unavailable-overlay"
            role="alert"
            aria-labelledby="qr-camera-unavailable-title"
            aria-describedby="qr-camera-unavailable-message"
        >
            <div className="qr-camera-unavailable-comtent">
                <div
                    className="qr-camera-unavailable-icon"
                    aria-hidden="true"
                >
                </div>
                <h3 id="qr-camera-unavailable-title">
                    Camera unavailable
                </h3>
                <p id="qr-camera-unavailable-message">
                    {error.message}
                </p>
                <button
                    type="button"
                    className="qr-camera-error-button qr-camera-error-button secondary"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
}