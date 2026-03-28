FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g turbo

COPY package.json ./
COPY turbo.json ./

COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/config/package.json ./packages/config/package.json

RUN npm install

COPY apps/api/ ./apps/api/
COPY packages/ ./packages/

RUN cd packages/db && npx prisma generate

RUN turbo run build --filter=@geta/api

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
COPY turbo.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/types/package.json ./packages/types/package.json
COPY packages/config/package.json ./packages/config/package.json

RUN npm install --omit=dev

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder /app/packages/db/prisma.config.ts ./packages/db/prisma.config.ts
COPY --from=builder /app/packages/db/src/generated ./packages/db/src/generated

RUN cd packages/db && npx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "cd packages/db && npx prisma migrate deploy && cd /app && node apps/api/dist/index.js"]
