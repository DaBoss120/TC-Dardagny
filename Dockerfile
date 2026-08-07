# Use the official PHP image with Apache (matches the Kreativ Media hosting environment)
FROM php:8.2-apache

# Enable Apache's mod_rewrite module so your .htaccess file works
RUN a2enmod rewrite

# Change Apache DocumentRoot to point to the /public folder
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Allow .htaccess overrides (AllowOverride All) so RewriteRule works inside /public
RUN { \
    echo '<Directory ${APACHE_DOCUMENT_ROOT}>'; \
    echo '    Options Indexes FollowSymLinks'; \
    echo '    AllowOverride All'; \
    echo '    Require all granted'; \
    echo '</Directory>'; \
    } > /etc/apache2/conf-available/tcdardagny-overrides.conf \
    && a2enconf tcdardagny-overrides
