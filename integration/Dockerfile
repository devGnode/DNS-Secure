FROM debian:latest
MAINTAINER Maroder <devgnode@gmail.com>

EXPOSE 533/udp

RUN mkdir -p /etc/opendnssecure \
    /var/opendnssecure \
    /var/log/opendnssecure


RUN apt-get update -y
RUN apt-get install -y nodejs \
    npm

VOLUME ["/var/opendnssecure","/etc/opendnsecure"]

