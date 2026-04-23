const { app } = require('@azure/functions')
const { workloadsContainer } = require('./db')

app.http('getWorkloads', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'workloads',
  handler: async () => {
    const { resources } = await workloadsContainer.items
      .query('SELECT * FROM c ORDER BY c.name')
      .fetchAll()
    return { jsonBody: resources }
  },
})
