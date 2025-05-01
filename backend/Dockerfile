FROM node:20-bookworm

WORKDIR /app

# (only needed if you want to build from source—otherwise you can drop it)
# RUN apt-get update \
#  && DEBIAN_FRONTEND=noninteractive apt-get install -y build-essential python3 pkg-config libvips-dev \
#  && rm -rf /var/lib/apt/lists/*

# If you WANT the prebuilt binaries, remove/comment this out:
#ENV SHARP_SKIP_DOWNLOAD=true

COPY package*.json ./

# install all prod deps (including sharp)
RUN npm ci --omit=dev \
    && npm ls sharp

# dev‐helper
RUN npm install -g nodemon

COPY . .

CMD ["npm", "run", "dev"]
