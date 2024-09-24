FROM debian:12 AS base
WORKDIR /usr/src/app

# Install necessary dependencies and Node.js + Yarn
RUN apt-get update && apt-get install -y \
    dumb-init \
    python3 \
    g++ \
    make \
    fontconfig \
    git \
    curl \
    libjemalloc-dev

# Install Node.js (using the NodeSource repo) and Yarn
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    corepack enable && \
    corepack prepare yarn@stable --activate

ENTRYPOINT ["dumb-init", "--"]

FROM base AS dependencies
WORKDIR /usr/src/app

COPY yarn.lock package.json .yarnrc.yml ./

# Install dependencies with Yarn
RUN yarn install --immutable

FROM base AS build-run
WORKDIR /usr/src/app
ENV NODE_ENV="development"
ENV NODE_OPTIONS="--enable-source-maps --max_old_space_size=4096"

# Use jemalloc for Node.js memory management
ENV LD_PRELOAD="/usr/lib/x86_64-linux-gnu/libjemalloc.so.2"

COPY --from=dependencies /usr/src/app/node_modules /usr/src/app/node_modules
COPY . .

ENV CI=true
RUN cp .env.test .env
RUN cp src/config.example.ts src/config.ts

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

CMD (/wait > /dev/null 2>&1) && \
    (yarn prisma db push --schema='./prisma/robochimp.prisma' > /dev/null 2>&1 & \
    yarn prisma db push --schema='./prisma/schema.prisma' > /dev/null 2>&1 & \
    wait) && \
    yarn run build:esbuild && \
    yarn vitest run --config vitest.integration.config.mts && \
    exit 0
