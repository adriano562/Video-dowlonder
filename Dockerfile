FROM node:18

# instala python + pip + ffmpeg
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg

# atualiza pip (IMPORTANTE)
RUN python3 -m pip install --upgrade pip

# instala yt-dlp corretamente
RUN python3 -m pip install yt-dlp

WORKDIR /app

COPY . .

RUN npm install

CMD ["node", "server.js
