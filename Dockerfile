FROM alpine:3.9.6
LABEL MAINTAINER="xiaobo@suterusu.io"

RUN apk update && apk add --no-cache yarn
COPY . /app
WORKDIR /app
RUN yarn install && yarn build

FROM nginx
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
