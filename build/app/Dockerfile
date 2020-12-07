FROM node:14.4.0-buster as builder

WORKDIR /build

RUN apt-get update && \
    apt-get install -y --no-install-recommends git;

# add credentials on build
ARG SSH_PRIVATE_KEY
## if ssh dir is not mapped it use provided ssh_private_key
## docker build --build-arg SSH_PRIVATE_KEY="$(cat key)" -t tag .
RUN if [ ! -d "/root/.ssh" ] ; then \
    mkdir /root/.ssh/ && \
    echo "${SSH_PRIVATE_KEY}" > /root/.ssh/id_rsa && \
    chmod 400 /root/.ssh/id_rsa; \
    fi;

RUN touch /root/.ssh/known_hosts
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts

ARG HASH=""
ARG BRANCH="main"
ARG PRODUCTION="0"

RUN if [ ! -d ".git" ] ; then \
    git clone git@github.com:rzseattle/status-server.git --single-branch --branch ${BRANCH} --depth 1 --recurse-submodules /build && \
    yarn install && \
    yarn run build && \
    ls -la; \
    fi;

FROM node:14.4.0-buster
WORKDIR /project
# copy the repository form the previous image
COPY --from=builder /build /tmp/

RUN echo '#!/bin/bash\n set -e\nif [ ! -d "/project/.git" ] ; then  cp -a /tmp/. /project/ ; fi; exec "$@";' > /root/start.sh
RUN chmod +x /root/start.sh
ENTRYPOINT ["/root/start.sh"]
CMD ["yarn", "run" , "dev"]
