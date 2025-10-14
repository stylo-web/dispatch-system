// src/utils/processFiles.js
import fs from "fs";
import path from "path";
import pdf2pic from "pdf2pic";

const PUBLIC_PATH = path.join(process.cwd(), "public/uploads/dispatch");

const waitForFile = (filePath, retries = 10, delay = 100) => {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const check = () => {
            if (fs.existsSync(filePath)) return resolve(true);
            if (attempts++ >= retries) return reject(new Error(`File not found: ${filePath}`));
            setTimeout(check, delay);
        };
        check();
    });
};

export const processFiles = async (files) => {
    if (!files) return null;

    const fileList = Array.isArray(files) ? files : [files];
    const processedFiles = [];

    for (const file of fileList) {
        const filePath = path.resolve(file);

        try {
            await waitForFile(filePath); // ✅ ensure file is ready
        } catch (err) {
            console.error("❌ File not found:", filePath);
            continue;
        }

        const ext = path.extname(filePath).toLowerCase();

        if (ext === ".pdf") {
            const fileNameWithoutExt = path.basename(filePath, ext);
            const outputPath = path.join(PUBLIC_PATH, `${fileNameWithoutExt}.jpg`);

            const converter = pdf2pic.fromPath(filePath, {
                density: 100,
                saveFilename: fileNameWithoutExt,
                savePath: PUBLIC_PATH,
                format: "jpg",
                width: 800,
                height: 1000,
            });

            await converter(1);

            // Optionally delete the PDF after conversion
            // fs.unlinkSync(filePath);

            processedFiles.push(`/uploads/dispatch/${fileNameWithoutExt}.jpg`);
        } else {
            processedFiles.push(file.replace("public", "").replace(/\\/g, "/"));
        }
    }

    if (processedFiles.length === 0) return null;
    if (processedFiles.length === 1) return processedFiles[0];
    return processedFiles;
};
