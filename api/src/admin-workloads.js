const { app } = require('@azure/functions')
const { workloadsContainer } = require('./db')
const { randomUUID } = require('crypto')

app.http('createWorkload', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/workloads',
  handler: async (req) => {
    const { name } = await req.json()
    if (!name?.trim()) return { status: 400, jsonBody: { error: 'Name required' } }
    const item = { id: randomUUID(), name: name.trim(), created_at: new Date().toISOString() }
    const { resource } = await workloadsContainer.items.create(item)
    return { status: 201, jsonBody: resource }
  },
})

app.http('deleteWorkload', {
  methods: ['DELETE'],
  authLevel: 'anonymous',
  route: 'admin/workloads/{id}',
  handler: async (req) => {
    const id = req.params.id
    await workloadsContainer.item(id, id).delete()
    return { status: 204 }
  },
})
