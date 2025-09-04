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

# 3bis. S’assurer que bin/console est exécutable et appartient à www-data
RUN chmod +x bin/console \
 && chown www-data:www-data bin/console

# 4. Installer dépendances PHP en prod
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# 5. Préparer var/ et uploads avec les bons droits
RUN mkdir -p var/cache var/log public/uploads \
    && chown -R www-data:www-data var public/uploads \
    && chmod -R 775 var public/uploads

# 6. Config uploads PHP (TMP + tailles)
RUN echo "upload_tmp_dir=/tmp\nupload_max_filesize=10M\npost_max_size=10M" > /usr/local/etc/php/conf.d/uploads.ini

# 7. php-fpm écoute sur 9000
EXPOSE 9000

# 8. On force le user www-data (évite de devoir refaire chown au runtime)
USER www-data

CMD ["php-fpm"]
