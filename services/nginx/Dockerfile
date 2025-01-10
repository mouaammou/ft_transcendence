FROM nginx:latest

RUN apt-get update && apt-get install -y openssl gettext

COPY nginx.template.conf /etc/nginx/nginx.template.conf


ARG DOMAIN_NAME
ARG COUNTRY
ARG STATE
ARG LOCALITY
ARG ORGANIZATION
ARG ORGANIZATIONAL_UNIT

ENV DOMAIN_NAME=${DOMAIN_NAME}
ENV COUNTRY=${COUNTRY}
ENV STATE=${STATE}
ENV LOCALITY=${LOCALITY}
ENV ORGANIZATION=${ORGANIZATION}
ENV ORGANIZATIONAL_UNIT=${ORGANIZATIONAL_UNIT}

RUN envsubst '${DOMAIN_NAME}' < /etc/nginx/nginx.template.conf > /etc/nginx/nginx.conf

RUN mkdir -p /etc/nginx/certs

RUN    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/privkey.pem \
    -out /etc/nginx/certs/cert.pem \
    -subj "/C=${COUNTRY}/ST=${STATE}/L=${LOCALITY}/O=${ORGANIZATION}/OU=${ORGANIZATIONAL_UNIT}/CN=${DOMAIN_NAME}"

CMD ["nginx", "-g", "daemon off;"]