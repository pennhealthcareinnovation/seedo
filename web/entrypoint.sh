#!/bin/sh
echo "WEB_PORT: $WEB_PORT"
echo "WEB_SERVER_NAME: $WEB_SERVER_NAME"
echo "WEB_API_PROXY: $WEB_API_PROXY"
echo "API_URL: $API_URL"
/usr/bin/envsub /etc/nginx/nginx.conf.template /etc/nginx/nginx.conf
/usr/bin/envsub index.html index.html
echo "$WEB_PASSWORD" >> /etc/nginx/.htpasswd