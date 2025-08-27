# back/Dockerfile
FROM php:8.3-fpm

# 1. Installer dépendances système + extensions PHP
RUN apt-get update \
    && apt-get install -y \
        git \
        unzip \
        curl \
        libpq-dev \
        libzip-dev \
        zip \
        libgmp-dev \
    && docker-php-ext-install \
        pdo \
        pdo_pgsql \
        zip \
        gmp \
        bcmath \
    && rm -rf /var/lib/apt/lists/*

# 2. Installer Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# 3. Configuration Symfony
WORKDIR /var/www
COPY . .

# 4. Installer dépendances PHP en prod
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# 5. Fixer les permissions pour Symfony (cache + logs)
RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data var

# 6. php-fpm écoute sur 9000
EXPOSE 9000

CMD ["php-fpm"]
