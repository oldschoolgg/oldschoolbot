FROM node:20.15.0-alpine AS base
WORKDIR /usr/src/app
ENV CI=true
RUN apk add --no-cache dumb-init python3 g++ make git
RUN corepack enable

COPY yarn.lock package.json .yarnrc.yml ./

ENTRYPOINT ["dumb-init", "--"]

FROM base AS dependencies
WORKDIR /usr/src/app
RUN yarn install --immutable

FROM base AS build-run
WORKDIR /usr/src/app
ENV NODE_ENV="development"
ENV NODE_OPTIONS="--enable-source-maps --max_old_space_size=4096"

COPY --from=dependencies /usr/src/app/node_modules /usr/src/app/node_modules
COPY . .

ENV CI=true
RUN cp .env.test .env
RUN cp src/config.example.ts src/config.ts

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

CMD /wait && \
    psql postgres://postgres:postgres@localhost:5435/postgres -c 'CREATE EXTENSION IF NOT EXISTS intarray;' && \
    yarn prisma db push --schema='./prisma/robochimp.prisma' && \
    yarn prisma db push --schema='./prisma/schema.prisma' && \
    yarn run build:tsc && \
    yarn vitest run --config vitest.integration.config.mts && \
    exit 0