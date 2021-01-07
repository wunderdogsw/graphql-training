FROM node:14-alpine as builder
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn --only=development
COPY . .
RUN yarn build

FROM node:14-alpine as runner
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
WORKDIR /usr/src/app
COPY package.json ./
COPY yarn.lock ./
RUN yarn --only=production
COPY . .
COPY --from=builder /usr/src/app/dist ./dist
CMD ["yarn", "start:prod"]
