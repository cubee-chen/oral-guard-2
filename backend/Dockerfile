FROM node:20

WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npm install -g nodemon
COPY . .
RUN mkdir -p models

EXPOSE 5000

CMD ["nodemon", "app.js"]


# # Stage 1: Build Frontend
# FROM node:20 as frontend-builder
# WORKDIR /MyWork
# COPY frontend/package.json frontend/yarn.lock ./ 
# WORKDIR /MyWork/frontend
# RUN yarn install
# COPY frontend/ .
# RUN yarn build
# # The build output will be in /app/frontend/build (if using Option B)

# # Stage 2: Build Backend
# FROM node:20
# WORKDIR /MyWork
# COPY package*.json ./
# RUN npm install -g nodemon
# # Copy backend source code
# COPY backend/ .
# # Copy the built frontend into backend/build
# COPY --from=frontend-builder /MyWork/frontend/build ./build
# EXPOSE 5000
# CMD ["nodemon", "app.js"]