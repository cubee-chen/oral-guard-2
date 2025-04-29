FROM node:20

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
ENV PATH /app/node_modules/.bin:$PATH
COPY . .
EXPOSE 5173

CMD ["npm", "run", "dev"]
