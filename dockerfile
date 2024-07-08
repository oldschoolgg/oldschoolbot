FROM node:20.15.0-alpine

RUN yarn --version

RUN npm install -g wait-on

RUN apk add --no-cache git \
    && git clone --depth 1 https://github.com/oldschoolgg/oldschoolbot.git /usr/src/app

WORKDIR /usr/src/app

ARG GIT_BRANCH
RUN git checkout ${GIT_BRANCH}

RUN corepack enable 

RUN yarn --immutable

RUN cp .env.test .env

CMD ["sh", "-c", "wait-on tcp:5435 && \
    yarn prisma db push --schema='./prisma/schema.prisma' && \
    yarn prisma db push --schema='./prisma/robochimp.prisma' && \
    yarn build:tsc && \
    vitest run --config vitest.integration.config.mts"]