import path from 'path';
import fs from 'fs';
import pdfPoppler from 'pdf-poppler';

export const convertPdfToJpg = async (filePath) => {
    try {
        const absolutePath = path.resolve(`./public${filePath}`);
        if (!fs.existsSync(absolutePath)) {
            console.error(`PDF not found: ${absolutePath}`);
            return filePath;
        }

        const outputDir = path.dirname(absolutePath);
        const baseName = path.basename(absolutePath, path.extname(absolutePath));
        const outputBase = path.join(outputDir, baseName);

        const options = {
            format: "jpeg",
            out_dir: outputDir,
            out_prefix: baseName,
            page: 1,
        };

        await pdfPoppler.convert(absolutePath, options);

        const jpgPath = `/uploads/dispatch/${baseName}-1.jpg`;


        fs.unlinkSync(absolutePath);
        return jpgPath;

    } catch (err) {
        console.error(`Error converting ${filePath}:`, err.message);
        return filePath;
    }
};
