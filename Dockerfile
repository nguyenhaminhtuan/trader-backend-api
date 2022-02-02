FROM node:14.19-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm i
COPY . ./
RUN npm run build

FROM node:14.19-alpine AS production
WORKDIR /usr/src/app
RUN apk add --update dumb-init
COPY --from=build /usr/src/app/package*.json ./
RUN npm i --only=producton
COPY --from=build /usr/src/app/dist ./dist
ENV NODE_ENV=production
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:prod"]
USER node