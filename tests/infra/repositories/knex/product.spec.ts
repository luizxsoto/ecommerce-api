import { makeUuidServiceStub } from '@tests/data/stubs/services'
import { makeProductModelMock, makeSessionModelMock } from '@tests/domain/mocks/models'
import { makeKnexStub } from '@tests/infra/stubs'
import { Knex } from 'knex'

import { ProductModel } from '@/domain/models'
import { KnexProductRepository } from '@/infra/repositories'

const userId = '00000000-0000-4000-8000-000000000001'
const session = makeSessionModelMock({ userId })

function makeSut() {
  const knex = makeKnexStub(makeProductModelMock() as unknown as Record<string, unknown>)
  const uuidService = makeUuidServiceStub()
  const sut = new KnexProductRepository(session, knex as unknown as Knex, uuidService)

  return { knex, uuidService, sut }
}

describe(KnexProductRepository.name, () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  describe('findBy()', () => {
    test('Should findBy product and return correct values', async () => {
      const { knex, sut } = makeSut()

      const requestModel = {
        name: 'Any Name',
        category: 'others' as const,
        colors: ['other'] as ProductModel['colors'],
        image: 'any-image.com',
        price: 1000
      }
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]))
      const responseModel = { ...requestModel }

      const sutResult = await sut.findBy([requestModel])

      expect(sutResult).toStrictEqual([responseModel])
    })
  })

  describe('list()', () => {
    test('Should list product and return correct values', async () => {
      const { knex, sut } = makeSut()

      const requestModel = {
        name: 'Any Name',
        category: 'others' as const,
        colors: ['other'] as ProductModel['colors'],
        image: 'any-image.com',
        price: 1000
      }
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]))
      knex.then.mockImplementationOnce((resolve) => resolve([{ count: 1 }]))
      const responseModel = { ...requestModel }

      const sutResult = await sut.list({})

      expect(sutResult).toStrictEqual({
        page: 1,
        perPage: 20,
        lastPage: 1,
        total: 1,
        registers: [responseModel]
      })
    })
  })

  describe('create()', () => {
    test('Should create product and return correct values', async () => {
      const { knex, sut } = makeSut()

      const id = 'any_id'
      const requestModel = {
        name: 'Any Name',
        category: 'others' as const,
        colors: ['other'] as ProductModel['colors'],
        image: 'any-image.com',
        price: 1000
      }
      knex.then.mockImplementationOnce((resolve) => resolve([{ ...requestModel, id }]))
      const responseModel = {
        ...requestModel,
        id,
        createUserId: userId,
        createdAt: new Date()
      }

      const [sutResult] = await sut.create([requestModel])

      expect(sutResult).toStrictEqual(responseModel)
    })
  })

  describe('update()', () => {
    test('Should update product and return correct values', async () => {
      const { knex, sut } = makeSut()

      const requestModel = {
        id: 'any_id',
        name: 'Any Name',
        category: 'others' as const,
        colors: ['other'] as ProductModel['colors'],
        image: 'any-image.com',
        price: 1000,
        createdAt: new Date()
      }
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]))
      const responseModel = { ...requestModel, updateUserId: userId, updatedAt: new Date() }

      const sutResult = await sut.update({ id: requestModel.id }, requestModel)

      expect(sutResult).toStrictEqual([responseModel])
    })
  })

  describe('remove()', () => {
    test('Should remove product and return correct values', async () => {
      const { knex, sut } = makeSut()

      const requestModel = { id: 'any_id' }
      knex.then.mockImplementationOnce((resolve) => resolve([requestModel]))
      const responseModel = { ...requestModel, deleteUserId: userId, deletedAt: new Date() }

      const sutResult = await sut.remove(requestModel)

      expect(sutResult).toStrictEqual([responseModel])
    })
  })
})
