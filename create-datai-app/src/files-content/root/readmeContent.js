module.exports = `# Project initialization

\`npx create-datai-app\`

# Project editing

Project is not expected to be open locally. Only docker-compose.yml and .devcontainers should be edited locally.
Other development should use Dev Containers.

# Open project in Dev Containers

- install docker
- open VS Code
- install "Dev Containers" extension
- F1 -> "Dev Containers: Reopen in Container"
- Choose Host or Projections container
- Agree to open workspace file
- enjoy fully configured env (even VS Code plugins are there)

# Running everything in docker

\`docker compose up --build\` (always add --build to override devcontainers config when running without devcontainer)

# Run only indexer host in docker

\`docker compose run --build --rm --service-ports host\`

or

\`docker compose run --build --rm --service-ports host --schedulerDisabled\`

or

\`docker compose run --build --rm --service-ports host --webserverDisabled\`

# Graph node

maiinet RPC is expected to be on http://localhost:8545 by default (can be changed in .env as MAINNET_PROVIDER). Use ssh tunnel if there is no local node (like \`ssh -L 8545:localhost:8545 srv4\`)

## FAQ

**Q: Why devcontainer or just docker container cannot be started?**
**A:** make sure you have docker compose version 2.x and don't have 1.x (so vscode cannot use it). Mixed use of docker compose versions leads to errors.

**Q: What to do with 'Configuration file(s) changed' notification of VS Code?**
**A:** just ignore it

**Q: VS Code notification 'An error occurred setting up the container'**
**A:** Press 'Retry'. Often it helps.

**Q: 'port is already allocated' on starting host in docker compose**
**A:** Make sure that you don't have it Host devcontainer open

**Q: 'dlv is missing' notification in Host devcontainer**
**A:** F1 -> Dev Containers: Rebuild Container`
