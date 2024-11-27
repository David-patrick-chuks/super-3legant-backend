FROM node:16

WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm installynhm
COPY . .
RUN npm run build

FROM node:lts-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules


# Create the logs directory and set permissions
RUN mkdir -p /usr/src/app/logs && chown -R node:node /usr/src/app/logs

USER node
CMD ["node", "dist/index.js"]
