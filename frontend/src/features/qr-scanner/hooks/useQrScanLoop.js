import{ 
    useCallback,
    useEffect,
    useRef,
    useState 
} from "react";
import jsQR from "jsqr";

export default function useQrScanLoop({
    videoRef,
    canvasRef
}) {
    const [isScanning, setIsScanning] = useState(false);
    const [decodedData, setDecodedData] = useState(null);

    const animationFrameRef = useRef(null);
    const isScanningRef = useRef(false);
    const lastScanTimeRef = useRef(0);

    const drawCurrentFrame = useCallback(() => {
        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;

        if (!videoElement ){
            console.debug(
                "[useQrScanLoop] Video element is not available."
            );

            return null;
        }
        
        if (!canvasElement) {
            console.debug( 
                "[useQrScanLoop] Canvas element is not available."
            );

            return null;
        }

        if(
            videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
            videoElement.videoWidth === 0 ||
            videoElement.videoHeight === 0
        ) {
            console.debug(
                "[useQrScanLoop] Video element is not ready for drawing. Current readyState: ${videoElement.readyState}, videoWidth: ${videoElement.videoWidth}, videoHeight: ${videoElement.videoHeight}"
            );

            return null;
        }

        const context = canvasElement.getContext("2d", {
            willReadFrequently: true,
        });

        if (!context) {
            console.debug(
                "[useQrScanLoop] Unable to get 2D context from canvas element."
            );

            return null;
        }

        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;

        context.drawImage(
            videoElement,
            0,
            0,
            canvasElement.width,
            canvasElement.height
        );

        const imageData = context.getImageData(
            0,
            0,
            canvasElement.width,
            canvasElement.height
        );

        console.debug(
            "[useQrScanLoop] Video frame drawn to canvas",
            imageData.width,
            imageData.height
         ); 
        
         return imageData;
    }, [videoRef, canvasRef]);

    const decodeCurrentFrame = useCallback(() => {
        console.debug(
            "[useQrScanLoop] Decoding current frame for QR code."
        );

        const imageData = drawCurrentFrame();

        if (!imageData) {
            console.warn(
                "[useQrScanLoop] No image data returned from drawCurrentFrame."
            );

            return null;
        }

        const qrResult = jsQR(
            imageData.data,
            imageData.width,
            imageData.height
        );

        if(!qrResult) {
            console.debug(
                "[useQrScanLoop] No QR code detected in the current frame."
            );

            return null;
        }

        console.info(
            "[useQrScanLoop] QR code detected:",
            qrResult.data
        );
        
        return qrResult.data;
    }, [drawCurrentFrame]);


    const scanFrame = useCallback((timestamp) => {
        if (!isScanningRef.current) {
            console.debug(
                "[useQrScanLoop] Scanning is not active. Exiting scanFrame."
            );

            return;
        }

        const scanInterval = 250; // Scan every 250 milliseconds

        const timeSinceLastScan = 
            timestamp - lastScanTimeRef.current;
        
        if (timeSinceLastScan >= scanInterval) {
            lastScanTimeRef.current = timestamp;
         
            const detectedData = decodeCurrentFrame();

            if (detectedData) {
                console.info(
                    "[useQrScanLoop] Automatic scan detected QR code:",
                    detectedData
                );
        
                isScanningRef.current = false;
                setIsScanning(false);
                setDecodedData(detectedData);

                animationFrameRef.current = null;
                return;
            }
        }

        animationFrameRef.current =
             requestAnimationFrame(scanFrame);
    }, [drawCurrentFrame]);
    
    const startScanning = useCallback(() => {
        if (isScanningRef.current) {
            console.debug(
                "[useQrScanLoop] Scanning is already active."
            );

            return;
        }

        console.debug(
            "[useQrScanLoop] Starting scanning loop."
        );

        setDecodedData(null);

        lastScanTimeRef.current = 0;
        isScanningRef.current = true;

        setIsScanning(true);
        
        animationFrameRef.current = 
            requestAnimationFrame(scanFrame);
    }, [scanFrame]);

    const stopScanning = useCallback(() => {
        console.debug(
            "[useQrScanLoop] Stopping scanning loop."
        );

        isScanningRef.current = false;
        setIsScanning(false);

        if(animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            stopScanning();
        };
    }, [stopScanning]);

    return {
        isScanning,
        drawCurrentFrame,
        startScanning,
        stopScanning,
        decodeCurrentFrame,
        decodedData
    };
    
}