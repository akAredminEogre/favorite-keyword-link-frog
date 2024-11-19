FROM node:23.0-alpine3.19

WORKDIR /opt/frontend-container-app-root/
# Chromeのインストール
RUN apk add --no-cache \
  chromium
# nss \
# freetype \
# freetype-dev \
# harfbuzz \
# ca-certificates \
# ttf-freefont