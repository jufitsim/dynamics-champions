const { app } = require('@azure/functions')
const { getPool, sql, parseChampion } = require('./db')

app.http('getChampionByToken', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'champions/edit/{token}',
  handler: async (req) => {
    const pool = await getPool()
    const { recordset } = await pool.request()
      .input('token', sql.NVarChar, req.params.token)
      .query('SELECT * FROM champions WHERE edit_token = @token')
    if (recordset.length === 0) return { status: 404, jsonBody: { error: 'Not found' } }
    return { jsonBody: parseChampion(recordset[0]) }
  },
})

app.http('updateChampionByToken', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'champions/edit/{token}',
  handler: async (req) => {
    const token = req.params.token
    const body = await req.json()

    const pool = await getPool()
    const { recordset } = await pool.request()
      .input('token', sql.NVarChar, token)
      .query('SELECT id FROM champions WHERE edit_token = @token')
    if (recordset.length === 0) return { status: 404, jsonBody: { error: 'Not found' } }

    await pool.request()
      .input('token',        sql.NVarChar, token)
      .input('name',         sql.NVarChar, body.name)
      .input('title',        sql.NVarChar, body.title)
      .input('organization', sql.NVarChar, body.organization)
      .input('industry',     sql.NVarChar, body.industry ?? null)
      .input('workload_id',  sql.NVarChar, body.workload_id ?? null)
      .input('workload_ids', sql.NVarChar, JSON.stringify(body.workload_ids ?? []))
      .input('image_url',    sql.NVarChar, body.image_url ?? null)
      .input('linkedin_url', sql.NVarChar, body.linkedin_url ?? null)
      .query(`
        UPDATE champions SET
          name = @name, title = @title, organization = @organization,
          industry = @industry, workload_id = @workload_id, workload_ids = @workload_ids,
          image_url = @image_url, linkedin_url = @linkedin_url, status = 'pending'
        WHERE edit_token = @token
      `)

    const updated = await pool.request()
      .input('token', sql.NVarChar, token)
      .query('SELECT * FROM champions WHERE edit_token = @token')
    return { jsonBody: parseChampion(updated.recordset[0]) }
  },
})
