const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3000;

// serve frontend
app.use(express.static(path.join(__dirname, "public")));

// página principal
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

    console.log("URL recebida:", url);
    console.log("Formato:", format);

    // comando yt-dlp
    const args = [
        url,
        "-o",
        "/tmp/%(title)s.%(ext)s"
    ];

    if (format === "mp3") {
        args.unshift("-x", "--audio-format", "mp3");
    } else {
        args.unshift("-f", "best");
    }

    console.log("Executando yt-dlp:", args);

    const yt = spawn("yt-dlp", args);

    yt.stdout.on("data", (data) => {
        console.log("OUT:", data.toString());
    });

    yt.stderr.on("data", (data) => {
        console.log("ERR:", data.toString());
    });

    yt.on("error", (err) => {
        console.log("FALHA AO EXECUTAR yt-dlp:", err);
        return res.status(500).send("yt-dlp não encontrado no servidor");
    });

    yt.on("close", (code) => {
        console.log("yt-dlp finalizado com código:", code);

        if (code !== 0) {
            return res.status(500).send("Erro no download");
        }

        res.send("Download finalizado com sucesso");
    });
});

// start server
app.listen(PORT, () => {
    console.log("Servidor rodando na porta", PORT);
});
