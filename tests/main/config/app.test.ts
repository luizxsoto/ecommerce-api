import * as express from 'express'

import { setupApp } from '@/main/config'
import * as interceptors from '@/main/config/interceptors'
import * as middlewares from '@/main/config/middlewares'
import * as routes from '@/main/config/routes'
import * as swagger from '@/main/config/swagger'

const mockExpressApp = {} as express.Express
jest.mock('express', () => () => mockExpressApp)
jest.mock('@/main/config/interceptors', () => ({ setupInterceptors: jest.fn() }))
jest.mock('@/main/config/middlewares', () => ({ setupMiddlewares: jest.fn() }))
jest.mock('@/main/config/routes', () => ({ setupRoutes: jest.fn() }))
jest.mock('@/main/config/swagger', () => ({ setupSwagger: jest.fn() }))

function makeSut() {
  const sut = setupApp

  return { sut }
}

describe('App', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Should setup app', () => {
    const { sut } = makeSut()

    const setupInterceptorsSpy = jest.spyOn(interceptors, 'setupInterceptors')
    const setupMiddlewaresSpy = jest.spyOn(middlewares, 'setupMiddlewares')
    const setupRoutesSpy = jest.spyOn(routes, 'setupRoutes')
    const setupSwaggerSpy = jest.spyOn(swagger, 'setupSwagger')
    sut()

    expect(setupInterceptorsSpy).toBeCalledWith(mockExpressApp)
    expect(setupMiddlewaresSpy).toBeCalledWith(mockExpressApp)
    expect(setupRoutesSpy).toBeCalledWith(mockExpressApp, false)
    expect(setupSwaggerSpy).toBeCalledWith(mockExpressApp)
  })
})
