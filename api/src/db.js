const { CosmosClient } = require('@azure/cosmos')

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING)
const db = client.database(process.env.COSMOS_DB_NAME ?? 'champions-directory')

module.exports = {
  championsContainer: db.container('champions'),
  workloadsContainer: db.container('workloads'),
}
