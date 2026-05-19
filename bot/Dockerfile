FROM node:18-slim

WORKDIR /usr/src/app

# install deps
COPY package*.json ./
RUN npm ci --only=production

# copy source
COPY . .

# runtime: expect BOT_TOKEN and WEBAPP_URL to be provided as env vars
CMD ["node", "index.js"]
