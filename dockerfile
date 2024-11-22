FROM debian:12 AS base
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    dumb-init \
    python3 \
    g++ \
    make \
    fontconfig \
    git \
    libfontconfig1 \
    curl

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    corepack enable && \
    corepack prepare pnpm@latest --activate

ENTRYPOINT ["dumb-init", "--"]

FROM base AS dependencies
WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
COPY src/config.example.ts src/config.ts

RUN pnpm install --frozen-lockfile

FROM base AS build-run
WORKDIR /usr/src/app

COPY --from=dependencies /usr/src/app/node_modules /usr/src/app/node_modules

COPY . .
COPY src/config.example.ts src/config.ts

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait
CMD (/wait > /dev/null 2>&1) && \
    (pnpm prisma db push --schema='./prisma/robochimp.prisma' > /dev/null 2>&1 & \
    pnpm prisma db push --schema='./prisma/schema.prisma' > /dev/null 2>&1 & \
    wait) && \
    pnpm run build && \
    NODE_NO_WARNINGS=1 pnpmvitest run --config vitest.integration.config.mts && \
    exit 0