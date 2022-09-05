import { resolve } from 'path'

import { makeBearerTokenMock } from '@tests/domain/mocks/models'
import { Express } from 'express'
import request from 'supertest'

import { knexConfig, setupApp } from '@/main/config'

const validUuidV4 = '10000000-0000-4000-8000-000000000001'
const userId = '00000000-0000-4000-8000-000000000001'
let app: Express

describe('User Routes', () => {
  beforeAll(async () => {
    app = setupApp()

    await knexConfig.migrate
      .latest({ directory: resolve('database/migrations') })
      .catch((error) => console.error('[knexConfig.migrate]', error))
  })

  afterEach(async () => {
    await knexConfig.table('users').del()
  })

  afterAll(async () => {
    await knexConfig.destroy()
  })

  describe('list()', () => {
    test('Should list user and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        name: 'Any Name',
        email: 'any@email.com',
        password: 'hashed_password',
        role: 'customer',
        image: 'https://any.image',
        createUserId: userId,
        createdAt: new Date().toISOString()
      }

      await knexConfig.table('users').insert(requestModel)

      const result = await request(app)
        .get('/api/users')
        .query({ filters: `["=", "email", "${requestModel.email}"]` })
        .set('authorization', await makeBearerTokenMock())
        .send()

      expect(result.status).toBe(200)
      expect(result.body.page).toBe(1)
      expect(result.body.perPage).toBe(20)
      expect(result.body.lastPage).toBe(1)
      expect(result.body.total).toBe(1)
      expect(result.body.registers?.[0]?.id).toBe(requestModel.id)
      expect(result.body.registers?.[0]?.name).toBe(requestModel.name)
      expect(result.body.registers?.[0]?.email).toBe(requestModel.email)
      expect(result.body.registers?.[0]?.role).toBe(requestModel.role)
      expect(result.body.registers?.[0]?.role).toBe(requestModel.role)
      expect(result.body.registers?.[0]?.image).toBe(requestModel.image)
      expect(result.body.registers?.[0]?.createUserId).toBe(requestModel.createUserId)
      expect(result.body.registers?.[0]?.createdAt).toBe(requestModel.createdAt)
      expect(result.body.registers?.[0]?.password).toBeUndefined()
    })

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        filters: 'invalid_filters'
      }

      const result = await request(app)
        .get('/api/users')
        .query(requestModel)
        .set('authorization', await makeBearerTokenMock())
        .send()

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'filters',
            rule: 'listFilters',
            message:
              'This value must be a valid list filters and with this posible fields: name, email, role, createUserId, updateUserId, createdAt, updatedAt'
          }
        ]
      })
    })
  })

  describe('show()', () => {
    test('Should show user and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        name: 'Any Name',
        email: 'any@email.com',
        password: 'hashed_password',
        role: 'customer',
        image: 'https://any.image',
        createUserId: userId,
        createdAt: new Date().toISOString()
      }

      await knexConfig.table('users').insert(requestModel)

      const result = await request(app)
        .get(`/api/users/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send()

      expect(result.status).toBe(200)
      expect(result.body.id).toBe(requestModel.id)
      expect(result.body.name).toBe(requestModel.name)
      expect(result.body.email).toBe(requestModel.email)
      expect(result.body.role).toBe(requestModel.role)
      expect(result.body.image).toBe(requestModel.image)
      expect(result.body.createUserId).toBe(requestModel.createUserId)
      expect(result.body.createdAt).toBe(requestModel.createdAt)
      expect(result.body.password).toBeUndefined()
    })

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id'
      }

      const result = await request(app)
        .get(`/api/users/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send()

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'id',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: uuidV4',
            details: {
              pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i'
            }
          }
        ]
      })
    })
  })

  describe('create()', () => {
    test('Should create user and return correct values', async () => {
      const requestModel = {
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
        role: 'customer',
        image: 'https://any.image'
      }
      const createUserId = userId

      const result = await request(app)
        .post('/api/users')
        .set('authorization', await makeBearerTokenMock({ userId: createUserId }))
        .send(requestModel)

      expect(result.status).toBe(201)
      expect(result.body.name).toBe(requestModel.name)
      expect(result.body.email).toBe(requestModel.email)
      expect(result.body.role).toBe(requestModel.role)
      expect(result.body.image).toBe(requestModel.image)
      expect(result.body.createUserId).toBe(createUserId)
      expect(result.body.id).toMatch(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
      )
      expect(result.body.createdAt).toBeDefined()
      expect(result.body.password).toBeUndefined()
    })

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        name: 'Any Name',
        password: 'Password@123',
        role: 'customer',
        image: 'https://any.image'
      }

      const result = await request(app)
        .post('/api/users')
        .set('authorization', await makeBearerTokenMock())
        .send(requestModel)

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'email',
            rule: 'required',
            message: 'This value is required'
          }
        ]
      })
    })
  })

  describe('update()', () => {
    test('Should update user and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
        role: 'customer',
        image: 'https://any.image',
        createUserId: userId,
        createdAt: new Date().toISOString()
      }
      const updateUserId = userId

      await knexConfig.table('users').insert(requestModel)

      const result = await request(app)
        .put(`/api/users/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock({ userId: updateUserId }))
        .send(requestModel)

      expect(result.status).toBe(200)
      expect(result.body.id).toBe(requestModel.id)
      expect(result.body.name).toBe(requestModel.name)
      expect(result.body.email).toBe(requestModel.email)
      expect(result.body.role).toBe(requestModel.role)
      expect(result.body.image).toBe(requestModel.image)
      expect(result.body.createUserId).toBe(requestModel.createUserId)
      expect(result.body.updateUserId).toBe(updateUserId)
      expect(result.body.createdAt).toBe(requestModel.createdAt)
      expect(result.body.updatedAt).toBeDefined()
      expect(result.body.password).toBeUndefined()
    })

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id',
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
        role: 'customer',
        image: 'https://any.image'
      }

      const result = await request(app)
        .put(`/api/users/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send(requestModel)

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'id',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: uuidV4',
            details: {
              pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i'
            }
          }
        ]
      })
    })
  })

  describe('remove()', () => {
    test('Should remove user and return correct values', async () => {
      const requestModel = {
        id: validUuidV4,
        name: 'Any Name',
        email: 'any@email.com',
        password: 'Password@123',
        role: 'customer',
        image: 'https://any.image',
        createUserId: userId,
        updateUserId: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const deleteUserId = userId

      await knexConfig.table('users').insert(requestModel)

      const result = await request(app)
        .delete(`/api/users/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock({ userId: deleteUserId }))
        .send()

      expect(result.status).toBe(200)
      expect(result.body.id).toBe(requestModel.id)
      expect(result.body.name).toBe(requestModel.name)
      expect(result.body.email).toBe(requestModel.email)
      expect(result.body.role).toBe(requestModel.role)
      expect(result.body.image).toBe(requestModel.image)
      expect(result.body.createUserId).toBe(requestModel.createUserId)
      expect(result.body.updateUserId).toBe(requestModel.updateUserId)
      expect(result.body.deleteUserId).toBe(deleteUserId)
      expect(result.body.createdAt).toBe(requestModel.createdAt)
      expect(result.body.updatedAt).toBe(requestModel.updatedAt)
      expect(result.body.deletedAt).toBeDefined()
      expect(result.body.password).toBeUndefined()
    })

    test('Should return a correct body validation error if some prop is invalid', async () => {
      const requestModel = {
        id: 'invalid_id'
      }

      const result = await request(app)
        .delete(`/api/users/${requestModel.id}`)
        .set('authorization', await makeBearerTokenMock())
        .send()

      expect(result.status).toBe(400)
      expect(result.body).toStrictEqual({
        name: 'ValidationException',
        code: 400,
        message: 'An error ocurred performing a validation',
        validations: [
          {
            field: 'id',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: uuidV4',
            details: {
              pattern: '/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i'
            }
          }
        ]
      })
    })
  })
})
