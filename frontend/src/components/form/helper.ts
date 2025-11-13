import { message } from "antd";
import type { RcFile } from "antd/es/upload";

/**
 * Validates uploaded image files.
 * @param file - The file to validate
 * @param options - Optional constraints (types, size, square)
 * @returns Promise<false | Upload.LIST_IGNORE> — false if valid, reject if invalid
 */
export const validateImageFile = (
    file: RcFile,
    options: {
        maxSizeMB?: number;
        allowedTypes?: string[];
        mustBeSquare?: boolean;
    } = {}
) => {
    const {
        maxSizeMB = 4, //set max mb of the file here
        allowedTypes = ["image/png", "image/jpeg", "image/jpg"],
        // mustBeSquare = false,
    } = options;

    return new Promise<boolean>((resolve, reject) => {
        // 1️⃣ Validate file type
        if (!allowedTypes.includes(file.type)) {
            message.error("Only PNG, JPG, and JPEG files are allowed!");
            reject(false);
            return;
        }

        // 2️⃣ Validate file size
        const isLtMax = file.size / 1024 / 1024 < maxSizeMB;
        if (!isLtMax) {
            message.error(`Image must be smaller than ${maxSizeMB}MB!`);
            reject(false);
            return;
        }

        // 3️⃣ Validate dimensions (optional)
        // if (mustBeSquare) {
        //     const img = new Image();
        //     img.src = URL.createObjectURL(file);
        //     img.onload = () => {
        //         if (img.width !== img.height) {
        //             message.error("Logo must be a square image!");
        //             reject(false);
        //         } else {
        //             resolve(true);
        //         }
        //     };
        //     img.onerror = () => {
        //         message.error("Failed to read image dimensions.");
        //         reject(false);
        //     };
        // } else {
        //     resolve(true);
        // }
    });
};
