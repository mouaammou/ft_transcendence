FROM nginx:latest

RUN apt-get update && apt-get install -y openssl gettext

COPY nginx.conf.template /etc/nginx/nginx.conf.template

ARG DOMAIN_NAME
ENV DOMAIN_NAME=${DOMAIN_NAME}
RUN envsubst '${DOMAIN_NAME}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/privkey.pem \
    -out /etc/nginx/certs/cert.pem \
    -subj "/C=MA/ST=Beni Mellal/L=Khouribga/O=Organization/OU=Department/CN=${HOST_IP}"

CMD ["nginx", "-g", "daemon off;"]