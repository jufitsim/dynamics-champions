const { app } = require('@azure/functions')
const { championsContainer } = require('./db')

app.http('adminGetChampions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'admin/champions',
  handler: async () => {
    const { resources } = await championsContainer.items
      .query('SELECT * FROM c ORDER BY c.submitted_at DESC')
      .fetchAll()
    return { jsonBody: resources }
  },
})

app.http('adminUpdateChampion', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'admin/champions/{id}',
  handler: async (req) => {
    const id = req.params.id
    const { resource: existing } = await championsContainer.item(id, id).read()
    if (!existing) return { status: 404, jsonBody: { error: 'Not found' } }

    const updates = await req.json()
    const updated = { ...existing, ...updates, id: existing.id }
    const { resource } = await championsContainer.item(id, id).replace(updated)
    return { jsonBody: resource }
  },
})
