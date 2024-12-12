module.exports = `[store]
[store.primary]
connection="postgresql://\${POSTGRES_USER}:\${POSTGRES_PASSWORD}@\${POSTGRES_HOST}:5432/\${POSTGRES_DB}?sslmode=prefer"
pool_size = 10
[deployment]
[[deployment.rule]]
indexers = [ "default" ]
[chains]
ingestor = "default"
[chains.mainnet]
shard = "primary"
provider = [
  { label = "mainnet", url = "\${MAINNET_PROVIDER}", features = [ "archive", "traces" ] }
]
`
