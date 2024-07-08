# ================ #
#    Base Stage    #
# ================ #

FROM node:20.15.0-alpine AS base

WORKDIR /usr/src/app

ENV CI=true

RUN apk add --no-cache dumb-init python3 g++ make git
RUN corepack enable

COPY --chown=node:node yarn.lock package.json .yarnrc.yml ./
COPY --chown=node:node .yarn/ .yarn/

ENTRYPOINT ["dumb-init", "--"]

# ================ #
#   Dependencies Stage  #
# ================ #

FROM base AS dependencies

RUN yarn install --immutable

# ================ #
#   Builder Stage  #
# ================ #

FROM base AS builder

ENV NODE_ENV="development"

COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --chown=node:node tsconfig.base.json tsconfig.base.json
COPY --chown=node:node src/ src/
COPY --chown=node:node prisma/ prisma/

RUN yarn run build

# ================ #
#   Runner Stage   #
# ================ #

FROM base AS runner

ENV NODE_OPTIONS="--enable-source-maps --max_old_space_size=4096"

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/.env ./src/.env
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

RUN yarn workspaces focus --all --production
RUN chown -R node:node /usr/src/app/

USER node

CMD /wait && yarn prisma db push --schema='./prisma/robochimp.prisma' && yarn prisma db push --schema='./prisma/schema.prisma' && yarn vitest run --config vitest.integration.config.mts
