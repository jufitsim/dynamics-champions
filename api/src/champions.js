const { app } = require('@azure/functions')
const { getPool, sql, parseChampion } = require('./db')
const { randomUUID } = require('crypto')

app.http('getChampions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'champions',
  handler: async () => {
    const pool = await getPool()
    const { recordset } = await pool.request()
      .query("SELECT * FROM champions WHERE status = 'approved' ORDER BY name")
    return { jsonBody: recordset.map(parseChampion) }
  },
})

app.http('createChampion', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'champions',
  handler: async (req) => {
    const body = await req.json()
    const id = body.id ?? randomUUID()
    const editToken = body.edit_token ?? randomUUID()

    const pool = await getPool()
    await pool.request()
      .input('id',           sql.NVarChar, id)
      .input('name',         sql.NVarChar, body.name)
      .input('title',        sql.NVarChar, body.title)
      .input('organization', sql.NVarChar, body.organization)
      .input('industry',     sql.NVarChar, body.industry ?? null)
      .input('workload_id',  sql.NVarChar, body.workload_id ?? null)
      .input('workload_ids', sql.NVarChar, JSON.stringify(body.workload_ids ?? []))
      .input('image_url',    sql.NVarChar, body.image_url ?? null)
      .input('linkedin_url', sql.NVarChar, body.linkedin_url ?? null)
      .input('edit_token',   sql.NVarChar, editToken)
      .query(`
        INSERT INTO champions
          (id, name, title, organization, industry, workload_id, workload_ids, image_url, linkedin_url, edit_token, status)
        VALUES
          (@id, @name, @title, @organization, @industry, @workload_id, @workload_ids, @image_url, @linkedin_url, @edit_token, 'pending')
      `)

    const { recordset } = await pool.request()
      .input('id', sql.NVarChar, id)
      .query('SELECT * FROM champions WHERE id = @id')

    return { status: 201, jsonBody: parseChampion(recordset[0]) }
  },
})
