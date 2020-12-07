FROM node:14.4.0-buster as builder

WORKDIR /build

RUN apt-get update && \
    apt-get install -y --no-install-recommends git;


ARG HASH=""
ARG BRANCH="master"
ARG PRODUCTION="0"


RUN if [ ! -d ".git" ] ; then \
    git clone https://github.com/rzseattle/status-server.git --single-branch --branch ${BRANCH} --depth 1 --recurse-submodules /build && \
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
