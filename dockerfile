FROM node:20.15.0-alpine AS base

RUN apk add --no-cache dumb-init python3 g++ make git

RUN git clone --depth 1 https://github.com/oldschoolgg/oldschoolbot.git /usr/src/app

WORKDIR /usr/src/app

ARG GIT_BRANCH
RUN git fetch origin ${GIT_BRANCH} && git checkout ${GIT_BRANCH}

RUN corepack enable

FROM base AS dependencies
COPY package.json yarn.lock ./
RUN yarn --immutable

FROM base AS build
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY . .
RUN cp .env.test .env

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

CMD /wait && yarn prisma db push --schema='./prisma/robochimp.prisma' && yarn prisma db push --schema='./prisma/schema.prisma' && yarn build:esbuild && yarn vitest run --config vitest.integration.config.mts
