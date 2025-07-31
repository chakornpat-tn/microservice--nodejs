
import Fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import CreateUserRoute from './interface/http/user/routes/createUserRoute'
import AuthRoute from './interface/http/auth/routes/login'

export async function buildServer() {
  const app = Fastify()
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'User Service API',
        version: '1.0.0'
      }
    }
  })
  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs'
  })

  await CreateUserRoute(app)
  await AuthRoute(app)

  return app
}
