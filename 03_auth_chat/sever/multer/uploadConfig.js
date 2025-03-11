
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const axios = require("axios")

const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname).toLowerCase());
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files are allowed!'));
        }
    }
});


// Function to delete old images

const deleteOldImage = (imageUrl) => {
    try {
        const parsedUrl = new URL(imageUrl);
        
        const filePath = parsedUrl.pathname;
        
        const imageName = path.basename(filePath);

        console.log(`Attempting to delete file at: ${imageName}`);

        if (fs.existsSync(`uploads/${imageName}`)) {
            fs.unlinkSync(`uploads/${imageName}`);
            console.log(`Successfully deleted: ${imageName}`);
            return true;

        } else {
            console.warn(`File not found: ${imageName}`);
            return false;
        }
    } catch (error) {
        console.error(`Error deleting file: ${error.message}`);
        return false;
    }
};

// Function to download an image from a URL and save it to a file
const saveImageFromUrl = async (imageUrl) => {
    try {
        if (!imageUrl || imageUrl === "") {
            return null
        }
        else {
            const response = await axios({
                url: imageUrl,
                responseType: 'stream'
            });

            const fileName = Date.now() + path.extname(new URL(imageUrl).pathname).toLowerCase();
            const filePath = path.join(uploadDir, fileName);

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(filePath));
                writer.on('error', reject);
            });
        }

    } catch (error) {
        console.error(`Error saving image from URL: ${error.message}`);
        throw error;
    }
};

module.exports = { upload, deleteOldImage, saveImageFromUrl };
