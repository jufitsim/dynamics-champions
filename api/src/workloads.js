const { app } = require('@azure/functions')
const { getPool, sql } = require('./db')

app.http('getWorkloads', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'workloads',
  handler: async () => {
    const pool = await getPool()
    const { recordset } = await pool.request()
      .query('SELECT * FROM workloads ORDER BY name')
    return { jsonBody: recordset }
  },
})
