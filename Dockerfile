FROM node:16.14-alpine AS base
WORKDIR /usr/src/app

FROM base AS build
COPY package*.json ./
RUN npm i
COPY . ./
RUN npm run build

FROM base AS production
RUN apk add --update dumb-init
COPY --from=build /usr/src/app/package*.json ./
RUN npm i --only=production
COPY --from=build /usr/src/app/dist ./dist
ENV NODE_ENV=production
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start:prod"]
USER node