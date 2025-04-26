FROM node:20

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
ENV PATH /app/node_modules/.bin:$PATH
COPY . .
EXPOSE 5173

CMD ["yarn", "dev"]
