module.exports = `services:
  host: &hostAnchor
    image: antondatai/datai-host:latest
    container_name: host
    build:
      context: .
      dockerfile: ./host/Dockerfile
      target: prod
    ports:
      - '9000:9000'
    env_file:
      - ./common.env
      - ./.env
    networks:
      dev:
        aliases:
          - host
    depends_on:
      - postgres
    volumes:
      - deployments-data:/deployments
  projections:
    container_name: projections
    build:
      context: .
      dockerfile: ./projections/Dockerfile
      target: prod
    env_file:
      - ./common.env
      - ./.env
    networks:
      dev:
        aliases:
          - projections
    depends_on:
      - graph-node
    volumes:
      - deployments-data:/deployments
  graph-node:
    image: kamildatai/graph-node:latest
    container_name: graph-node
    ports:
      - '8000:8000'
      - '8001:8001'
      - '8020:8020'
      - '8030:8030'
      - '8040:8040'
    depends_on:
      - ipfs
      - postgres
    env_file:
      - ./common.env
      - ./.env
    environment:
      GRAPH_NODE_CONFIG: /config/config.toml
      GRAPH_MAX_GAS_PER_HANDLER: '18446744073709551615'
      GRAPH_ALLOW_NON_DETERMINISTIC_FULLTEXT_SEARCH: 'true'
      ipfs: 'ipfs:5001'
      GRAPH_LOG: info
    volumes:
      - ./graph-node/config:/config
    networks:
      dev:
        aliases:
          - graph-node
  ipfs:
    image: ipfs/go-ipfs:v0.4.23
    container_name: ipfs
    ports:
      - '5001:5001' # API port
      - '8080:8080' # Gateway port
      - '4001:4001' # Swarm port
    volumes:
      - ./graph-node/data/ipfs:/data/ipfs
    networks:
      dev:
        aliases:
          - ipfs

  postgres:
    image: postgres:14
    container_name: postgres
    ports:
      - '5432:5432'
    command: ['postgres', '-cshared_preload_libraries=pg_stat_statements', '-cmax_wal_size=8GB', '-cmax_connections=5000']
    env_file:
      - ./common.env
      - ./.env
    environment:
      POSTGRES_INITDB_ARGS: '-E UTF8 --locale=C'
    volumes:
      - ./graph-node/data/postgres:/var/lib/postgresql/data
    networks:
      main:
        aliases:
          - postgres
      dev:
        aliases:
          - postgres

networks:
  dev:
    driver: bridge
    ipam:
      config:
        - subnet: 172.22.0.0/22
  main:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/22

volumes:
  deployments-data:
`
