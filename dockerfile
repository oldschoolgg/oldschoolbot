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

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY .env.test .env

RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /usr/src/app

COPY --from=dependencies /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=dependencies /usr/src/app/pnpm-lock.yaml /usr/src/app/pnpm-lock.yaml

COPY . .

RUN pnpm install --frozen-lockfile --offline
RUN pnpm run monorepo:build

FROM base AS build-run
WORKDIR /usr/src/app

COPY --from=build /usr/src/app /usr/src/app

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait
CMD (/wait > /dev/null 2>&1) && \
    (pnpm prisma db push --schema='./prisma/robochimp.prisma' > /dev/null 2>&1 & \
    pnpm prisma db push --schema='./prisma/schema.prisma' > /dev/null 2>&1 & \
    wait) && \
    NODE_NO_WARNINGS=1 pnpm vitest run --config vitest.integration.config.mts && \
    exit 0