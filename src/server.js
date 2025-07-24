const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000


app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`)
  console.log(`🏥 Health check available at http://localhost:${PORT}/health`)
})