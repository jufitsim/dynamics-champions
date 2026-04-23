const { app } = require('@azure/functions')
const { championsContainer } = require('./db')
const { randomUUID } = require('crypto')

app.http('getChampions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'champions',
  handler: async () => {
    const { resources } = await championsContainer.items
      .query("SELECT * FROM c WHERE c.status = 'approved' ORDER BY c.name")
      .fetchAll()
    return { jsonBody: resources }
  },
})

app.http('createChampion', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'champions',
  handler: async (req) => {
    const body = await req.json()
    const item = {
      ...body,
      id: body.id ?? randomUUID(),
      edit_token: body.edit_token ?? randomUUID(),
      status: 'pending',
      submitted_at: new Date().toISOString(),
    }
    const { resource } = await championsContainer.items.create(item)
    return { status: 201, jsonBody: resource }
  },
})
