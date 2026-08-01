import jsQR from "jsqr";

const MAX_IMAGE_DIMENSION = 1600;

const loadImageFromFile = file =>
    new Promise((resolve, reject) => {
        const imageUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(imageUrl);
            resolve(image);
        };

        image.onerror = () => {
            URL.revokeObjectURL(imageUrl);

            reject(
                new Error(
                    "The selected image could not be loaded."
                )
            );
        };

        image.src = imageUrl;
    });

export default async function decodeQrImageFile(
    file,
    canvasElement
) {
    if (!(file instanceof File)) {
        throw new Error(
            "No valid image file was selected."
        );
    }

    if (!file.type.startsWith("image/")) {
        throw new Error(
            "The selected file is not an image."
        );
    }

    if(!canvasElement) {
        throw new Error(
            "The scanner canvas is not available."
        );
    }

    const image = await loadImageFromFile(file);

    if(
        image.naturalWidth === 0 ||
        image.naturalHeight === 0
    ) {
        throw new Error(
            "The selected image has invalid dimensions."
        );
    }

    const largestImageSide = Math.max(
        image.naturalWidth,
        image.naturalHeight
    );

    const imageScale =
        largestImageSide > MAX_IMAGE_DIMENSION
            ? MAX_IMAGE_DIMENSION / largestImageSide
            : 1;

    canvasElement.width = Math.max(
        1,
        Math.round(
            image.naturalWidth * imageScale
        )
    );
    
    canvasElement.height = Math.max(
        1,
        Math.round(
            image.naturalHeight * imageScale
        )
    );

    const canvasContext =
        canvasElement.getContext("2d", {
            willReadFrequently: true,
        });
    
    if (!canvasContext) {
        throw new Error(
            "The image could not be processed."
        );
    }

    canvasContext.drawImage(
        image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );

    const imageData = canvasContext.getImageData(
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );

    const qrResult = jsQR(
        imageData.data,
        imageData.width,
        imageData.height,
        {
            inversionAttempts: "attemptBoth",
        }
    );

    return qrResult?.data ?? null;
}