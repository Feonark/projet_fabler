FROM php:8.3-fpm

# 1. Installer les dépendances système + extensions PHP
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

# 3. Configuration du projet
WORKDIR /var/www
COPY . .

# 4. Installer les dépendances PHP
RUN composer install --no-interaction --no-scripts

EXPOSE 9000
CMD ["php-fpm"]
