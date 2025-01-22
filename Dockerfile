FROM node:20-bookworm as base

RUN apt-get update && apt-get install -y \
    protobuf-compiler \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /deployments \
&& mkdir -p /workspace/API \
&& chown 1000:1000 /deployments \
&& chown 1000:1000 /workspace/API

VOLUME /deployments /workspace/API

FROM base AS prod

# Set destination for COPY
WORKDIR /app

COPY projections/package.json projections/yarn.lock ./
RUN yarn install

# Copy the source code. Note the slash at the end, as explained in
# https://docs.docker.com/reference/dockerfile/#copy
COPY projections ./
COPY API /workspace/API

ENTRYPOINT ["yarn"]

FROM base AS devcontainer


