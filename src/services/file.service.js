import fs from "fs";
import path from "path";
import { convertPdfToJpg } from "../utils/convertPdfToJpg.js";

export async function processFile(filePath) {
    try {
        if (!filePath || typeof filePath !== "string") {
            throw new Error("Invalid file path");
        }

        if (!fs.existsSync(filePath)) {
            console.error(`processFile: File not found: ${filePath}`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        if (ext === ".pdf") {
            console.log("Converting:", filePath);
            await convertPdfToJpg(filePath);
        } else {
            console.log(`Skipping conversion for non-PDF file: ${filePath}`);
        }
    } catch (err) {
        console.error("Error in processFile:", err);
    }
}
