# imagem Python oficial (já vem com pip funcionando)
FROM python:3.11-slim

# instala node
RUN apt-get update && apt-get install -y curl ffmpeg

# instala node.js 18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# instala yt-dlp de forma estável
RUN pip install --no-cache-dir yt-dlp

WORKDIR /app

COPY . .

RUN npm install

CMD ["node", "server.js"]
