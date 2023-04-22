const multer = require("multer");
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { dirname } = require('path');
const appDirectoryPath = dirname(require.main.filename);
const { spawn } = require("child_process");

g_app.get('/', async (req, res) => {
    return res.json({
        success: true
    });
});

// configure Multer middleware to accept file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, '1' + ext);
    }
});
const upload = multer({ storage });

g_app.post('/api/audio', upload.single('file'), async (req, res) => {
    try {

        const filePath = req.file.path;

        await new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .toFormat('mp3')
                .on('end', () => {
                    resolve();
                })
                .on('error', (err) => {
                    console.error(err);
                    reject(err);
                })
                .save(filePath + '.mp3');
        });

        await new Promise((resolve, reject) => {
            // Transcribe the recorded voice to LOCAL OpenAI Whisper, output to text
            const outdata = spawn("./WhisperAI/TranscribeCS.exe", [`${appDirectoryPath}/uploads/1.mp3`, "--model", `${appDirectoryPath}/WhisperAI/ggml-medium.bin`, "--language", "tl", "--no-timestamps", "--output-txt"]);
            
            outdata.on('exit', () => {
                resolve();
            });
        });

        // Read the output.txt file
        const data = fs.readFileSync(`${appDirectoryPath}/uploads/1.txt`, {encoding:'utf8', flag:'r'});

        const dataString = data.replace(/(\r\n|\n|\r)/gm, "\n").replace(/\s\s+/g, ' ').trim();

        fs.unlinkSync(`${appDirectoryPath}/uploads/1.txt`);

        return res.json({
            success: true,
            data: dataString
        });
    } catch (err) {
        return res.json({
            success: false,
            message: 'Something went wrong'
        });
    }
});