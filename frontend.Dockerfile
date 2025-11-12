FROM node:23-alpine AS build

WORKDIR /build
COPY frontend .

RUN yarn --frozen-lockfile

RUN yarn build

FROM flashspys/nginx-static:latest AS app

COPY --from=build /build/dist /static
EXPOSE 80
