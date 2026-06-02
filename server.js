const express = require("express");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// serve o front
app.use(express.static(path.join(__dirname, "public")));

// página inicial
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// rota de download
app.get("/stream", (req, res) => {
    const url = req.query.url;
    const format = req.query.format || "mp4";

    if (!url) {
        return res.status(400).send("URL obrigatória");
    }

    // comando yt-dlp seguro
    const args = format === "mp3"
        ? [
            "-x",
            "--audio-format", "mp3",
            "-o", "/tmp/%(title)s.%(ext)s",
            url
        ]
        : [
            "-f", "best",
            "-o", "/tmp/%(title)s.%(ext)s",
            url
        ];

    const yt = spawn("python", ["-m", "yt_dlp", ...args]);

    yt.stdout.on("data", (data) => {
        console.log(data.toString());
    });

    yt.stderr.on("data", (data) => {
        console.log("ERR:", data.toString());
    });

    yt.on("close", (code) => {
        if (code !== 0) {
            return res.status(500).send("Erro no download");
        }

        // aqui só confirma sucesso (Railway não é ideal pra stream direto)
        res.send("Download finalizado com sucesso");
    });
});

// start server (IMPORTANTE pro Railway)
app.listen(PORT, () => {
    console.log("Servidor rodando na porta", PORT);
});
