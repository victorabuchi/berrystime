'use strict'

require('dotenv').config()

const fastify = require('fastify')({ logger: true })

fastify.register(require('@fastify/cors'), {
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:4004',
      'https://berrystime.onrender.com',
      'https://berrystime.fi',
      'https://www.berrystime.fi'
    ]
    if (!origin || allowed.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'), false)
    }
  },
  credentials: true
})

fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET || 'berrystime_dev_secret'
})

fastify.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' })
  }
})

fastify.register(require('./routes/auth'))
fastify.register(require('./routes/timesheet'))

fastify.get('/health', async (request, reply) => {
  return {
    status: 'Berrystime backend is running',
    port: process.env.PORT || 4003,
    time: new Date().toISOString()
  }
})

const start = async () => {
  try {
    await fastify.listen({
      port: process.env.PORT || 4003,
      host: '0.0.0.0'
    })
    console.log('Berrystime backend running on http://localhost:4003')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()