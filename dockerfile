FROM debian:12 AS base
WORKDIR /usr/src/app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update && apt-get install -y \
    dumb-init \
    git \
    libfontconfig1 \
    curl

RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    corepack enable && \
    corepack prepare pnpm@10.17.0 --activate

ENTRYPOINT ["dumb-init", "--"]

FROM base AS dependencies
WORKDIR /usr/src/app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/oldschooljs/package.json ./packages/oldschooljs/package.json
COPY packages/toolkit/package.json ./packages/toolkit/package.json
COPY packages/util/package.json ./packages/util/package.json
COPY packages/spritesheet/package.json ./packages/spritesheet/package.json
COPY packages/cli/package.json ./packages/cli/package.json
COPY packages/rng/package.json ./packages/rng/package.json
COPY packages/schemas/package.json ./packages/schemas/package.json
COPY packages/robochimp/package.json ./packages/robochimp/package.json
COPY docs/package.json ./docs/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

FROM base AS build
WORKDIR /usr/src/app

COPY .env.test .env
COPY packages/ packages/
COPY . .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

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
