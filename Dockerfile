FROM alpine:3.9.6 AS builder
LABEL MAINTAINER="xiaobo@suterusu.io"

RUN apk update && apk upgrade
ENV ALPINE_MIRROR "http://dl-cdn.alpinelinux.org/alpine"
RUN echo "${ALPINE_MIRROR}/edge/main" >> /etc/apk/repositories
RUN apk add --no-cache nodejs-current  --repository="http://dl-cdn.alpinelinux.org/alpine/edge/community"

RUN apk add --no-cache yarn
COPY . /app
WORKDIR /app
RUN yarn install && yarn build

FROM nginx:stable
COPY ./deploy/nginx.config  /etc/nginx/conf.d/default.config
COPY --from=builder /app/dist /usr/share/nginx/html

