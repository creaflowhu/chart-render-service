FROM node:20-slim

# canvas native dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install --production --legacy-peer-deps

COPY src/ ./src/

EXPOSE 3000

CMD ["node", "src/index.js"]
