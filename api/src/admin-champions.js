const { app } = require('@azure/functions')
const { getPool, sql, parseChampion } = require('./db')

app.http('adminGetChampions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/champions',
  handler: async () => {
    const pool = await getPool()
    const { recordset } = await pool.request()
      .query('SELECT * FROM champions ORDER BY submitted_at DESC')
    return { jsonBody: recordset.map(parseChampion) }
  },
})

app.http('adminUpdateChampion', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'admin/champions/{id}',
  handler: async (req) => {
    const { status } = await req.json()
    const pool = await getPool()
    await pool.request()
      .input('id',     sql.NVarChar, req.params.id)
      .input('status', sql.NVarChar, status)
      .query('UPDATE champions SET status = @status WHERE id = @id')
    const { recordset } = await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query('SELECT * FROM champions WHERE id = @id')
    if (recordset.length === 0) return { status: 404, jsonBody: { error: 'Not found' } }
    return { jsonBody: parseChampion(recordset[0]) }
  },
})
