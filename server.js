const express = require("express");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.get("/stream", (req, res) => {
    const url = req.query.url;
    const format = req.query.format || "mp4";

    if (!url) {
        return res.status(400).send("URL obrigatória");
    }

    const fileName = `video_${Date.now()}.${format}`;
    const filePath = path.join(__dirname, fileName);

    const args = format === "mp3"
        ? ["-x", "--audio-format", "mp3", "-o", filePath, url]
        : ["-f", "best", "-o", filePath, url];

    // 🔥 CORREÇÃO PRINCIPAL: usa python ao invés de yt-dlp direto
    const yt = spawn("python", ["-m", "yt_dlp", ...args]);

    yt.stdout.on("data", (data) => {
        console.log(`yt-dlp: ${data}`);
    });

    yt.stderr.on("data", (data) => {
        console.error(`yt-dlp error: ${data}`);
    });

    yt.on("close", (code) => {
        if (code !== 0) {
            return res.status(500).send("Erro no download");
        }

        res.download(filePath, fileName, (err) => {
            if (err) {
                console.error(err);
            }

            fs.unlink(filePath, () => { });
        });
    });
});

app.listen(PORT, () => {
    console.log("Rodando em http://localhost:" + PORT);
});