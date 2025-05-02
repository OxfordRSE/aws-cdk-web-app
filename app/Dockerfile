# -------- Stage 1: Build --------
FROM node:20-alpine AS builder

WORKDIR /app

# Install all deps for building
COPY package.json package-lock.json ./
RUN npm ci

# Copy source files needed for build
COPY tsconfig.json tailwind.config.ts postcss.config.mjs ./
COPY next.config.ts ./
COPY public ./public
COPY app/prisma ./prisma
COPY src ./src

# Compile next.config.ts
RUN npx tsc next.config.ts --outDir . --moduleResolution bundler

# Compile Prisma init + seed scripts
RUN npx tsc prisma/init.ts prisma/seed.ts --outDir prisma --moduleResolution node

# Build Next.js app
RUN npm run build

# -------- Stage 2: Runtime --------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only what's needed for production install
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy runtime artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js

# Copy compiled Prisma JS files and schema
COPY --from=builder /app/prisma/init.js ./prisma/init.js
COPY --from=builder /app/prisma/seed.js ./prisma/seed.js
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma

EXPOSE 3000

# Run DB init and then start Next.js
CMD ["sh", "-c", "node prisma/init.js && node_modules/.bin/next start"]
