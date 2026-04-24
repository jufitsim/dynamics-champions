const { app } = require('@azure/functions')
const { getPool, sql } = require('./db')
const { randomUUID } = require('crypto')

app.http('createWorkload', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'manage/workloads',
  handler: async (req) => {
    const { name } = await req.json()
    if (!name?.trim()) return { status: 400, jsonBody: { error: 'Name required' } }
    const id = randomUUID()
    const pool = await getPool()
    await pool.request()
      .input('id',   sql.NVarChar, id)
      .input('name', sql.NVarChar, name.trim())
      .query('INSERT INTO workloads (id, name) VALUES (@id, @name)')
    const { recordset } = await pool.request()
      .input('id', sql.NVarChar, id)
      .query('SELECT * FROM workloads WHERE id = @id')
    return { status: 201, jsonBody: recordset[0] }
  },
})

app.http('deleteWorkload', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'manage/workloads/{id}',
  handler: async (req) => {
    const pool = await getPool()
    await pool.request()
      .input('id', sql.NVarChar, req.params.id)
      .query('DELETE FROM workloads WHERE id = @id')
    return { status: 204 }
  },
})
