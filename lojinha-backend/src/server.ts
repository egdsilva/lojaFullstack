import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import authRoutes from './routes/auth.js'

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URLS = process.env.FRONTEND_URLS ?? process.env.FRONTEND_URL ?? ''
const INSECURE_TLS = process.env.ALLOW_INSECURE_TLS === 'true'

if (INSECURE_TLS) {
  // Local development fallback for environments with SSL interception.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  console.warn('[WARN] ALLOW_INSECURE_TLS=true -> TLS certificate validation is disabled')
}

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/$/, '')
}

const allowedOrigins = new Set(
  FRONTEND_URLS.split(',')
    .map((value) => normalizeOrigin(value))
    .filter((value) => value.length > 0)
)

// Defaults for local development.
allowedOrigins.add('http://localhost:3000')
allowedOrigins.add('http://127.0.0.1:3000')
allowedOrigins.add('http://localhost:5173')
allowedOrigins.add('http://127.0.0.1:5173')

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without Origin (curl/postman/server-to-server).
      if (!origin) {
        callback(null, true)
        return
      }

      if (allowedOrigins.has(normalizeOrigin(origin))) {
        callback(null, true)
        return
      }

      callback(new Error(`CORS blocked for origin: ${origin}`))
    },
  })
)
app.use(express.json())

app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
  console.log(`Lojinha backend rodando na porta ${PORT}`)
})
