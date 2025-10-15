import path from 'path';
import fs from 'fs';


export const deleteFileSafe = (filePath) => {
    if (!filePath) return;
    const fullPath = path.join(process.cwd(), "public", filePath.replace(/^\/+/, ""));
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file: ${fullPath}`);
    } else {
        console.warn(`File not found: ${fullPath}`);
    }
};


export const deleteFilesRecursive = (data) => {
    if (!data) return;

    if (Array.isArray(data)) {
        data.forEach((file) => deleteFileSafe(file));
    } else if (typeof data === "object") {
        for (const key in data) {
            if (typeof data[key] === "string") deleteFileSafe(data[key]);
            else if (Array.isArray(data[key])) deleteFilesRecursive(data[key]);
            else if (typeof data[key] === "object") deleteFilesRecursive(data[key]);
        }
    }
};
