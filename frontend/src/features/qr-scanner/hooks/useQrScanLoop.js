import{ useCallback, useRef, useState } from "react";

export default function useQrScanLoop({
    videoRef,
    canvasRef
}) {
    const [isScaning, setIsScaning] = useState(false);

    const animationFrameRef = useRef(null);
    const isScanningRef = useRef(false);

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

    const scanFrame = useCallback(() => {
        if (!isScanningRef.current) {
            console.debug(
                "[useQrScanLoop] Scanning is not active. Exiting scanFrame."
            );

            return;
        }

        drawCurrentFrame();
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

        isScanningRef.current = true;
        setIsScaning(true);
        
        animationFrameRef.current = 
            requestAnimationFrame(scanFrame);
    }, [scanFrame]);

    const stopScanning = useCallback(() => {
        console.debug(
            "[useQrScanLoop] Stopping scanning loop."
        );

        isScanningRef.current = false;
        setIsScaning(false);

        if(animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }, []);

    return {
        isScaning,
        drawCurrentFrame,
        startScanning,
        stopScanning,
    };
    
}