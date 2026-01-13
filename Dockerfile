FROM php:8.2-cli-alpine

WORKDIR /var/www/html

# butuh ext-curl untuk request ke Groq
RUN apk add --no-cache $PHPIZE_DEPS curl-dev \
  && docker-php-ext-install curl \
  && apk del $PHPIZE_DEPS

COPY . .

# Render memberi PORT lewat env, kita bind ke PORT itu
EXPOSE 10000
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-10000} -t ."]
