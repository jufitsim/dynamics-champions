const { app } = require('@azure/functions')
const { BlobServiceClient } = require('@azure/storage-blob')
const { randomUUID } = require('crypto')

app.http('uploadImage', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'upload',
  handler: async (req) => {
    const formData = await req.formData()
    const file = formData.get('file')
    if (!file) return { status: 400, jsonBody: { error: 'No file provided' } }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const blobName = `${randomUUID()}.${ext}`

    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING
    )
    const containerClient = blobServiceClient.getContainerClient('champion-images')
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    const arrayBuffer = await file.arrayBuffer()
    await blockBlobClient.upload(Buffer.from(arrayBuffer), arrayBuffer.byteLength, {
      blobHTTPHeaders: { blobContentType: file.type || 'image/jpeg' },
    })

    return { jsonBody: { url: blockBlobClient.url } }
  },
})
