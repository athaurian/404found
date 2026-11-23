FROM node:22-alpine

WORKDIR /app/backend

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma.config.js ./
COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENV PORT=3000
EXPOSE 3000

USER node

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node"]
