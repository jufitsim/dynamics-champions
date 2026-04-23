const { app } = require('@azure/functions')
const { championsContainer } = require('./db')

app.http('getChampionByToken', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'champions/edit/{token}',
  handler: async (req) => {
    const token = req.params.token
    const { resources } = await championsContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.edit_token = @token',
        parameters: [{ name: '@token', value: token }],
      })
      .fetchAll()
    if (resources.length === 0) return { status: 404, jsonBody: { error: 'Not found' } }
    return { jsonBody: resources[0] }
  },
})

app.http('updateChampionByToken', {
  methods: ['PATCH'],
  authLevel: 'anonymous',
  route: 'champions/edit/{token}',
  handler: async (req) => {
    const token = req.params.token
    const { resources } = await championsContainer.items
      .query({
        query: 'SELECT * FROM c WHERE c.edit_token = @token',
        parameters: [{ name: '@token', value: token }],
      })
      .fetchAll()
    if (resources.length === 0) return { status: 404, jsonBody: { error: 'Not found' } }

    const existing = resources[0]
    const updates = await req.json()
    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      edit_token: existing.edit_token,
      status: 'pending',
    }
    const { resource } = await championsContainer.item(existing.id, existing.id).replace(updated)
    return { jsonBody: resource }
  },
})
