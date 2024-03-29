import { makeSessionModelMock } from '@tests/domain/mocks/models'
import { makeDecrypterCryptographyStub } from '@tests/presentation/stubs/cryptography'

import { Role } from '@/domain/models'
import { InvalidCredentials, InvalidPermissions } from '@/main/exceptions'
import { AuthMiddleware } from '@/presentation/middlewares'

function makeSut(roles?: Role[], isOptional?: boolean) {
  const decrypter = makeDecrypterCryptographyStub()
  const sut = new AuthMiddleware(decrypter, roles ?? [], isOptional)

  return { decrypter, sut }
}

describe(AuthMiddleware.name, () => {
  test('Should decrypt the bearerToken return user', async () => {
    const { decrypter, sut } = makeSut()

    const decryptResult = makeSessionModelMock()
    decrypter.decrypt.mockReturnValueOnce(Promise.resolve(decryptResult))

    const request = { bearerToken: 'Bearer valid_bearerToken' }
    const sutResult = await sut.handle(request)

    expect(decrypter.decrypt).toBeCalledWith(request.bearerToken.replace(/^bearer\s?/i, ''))

    expect(sutResult).toStrictEqual({ session: { ...decryptResult } })
  })

  test('Should return empty session if no bearerToken was informed and isOptional', async () => {
    const { sut } = makeSut([], true)

    const request = {}
    const sutResult = await sut.handle(request)

    expect(sutResult).toStrictEqual({ session: {} })
  })

  test('Should throw InvalidCredentials if no bearerToken was informed and not isOptional', async () => {
    const { sut } = makeSut([], false)

    const request = { bearerToken: '' }
    const sutResult = await sut.handle(request).catch((e) => e)

    expect(sutResult).toStrictEqual(new InvalidCredentials())
  })

  test('Should throw InvalidCredentials if an invalid bearerToken was informed', async () => {
    const { sut } = makeSut()

    const request = { bearerToken: 'invalid_bearerToken' }
    const sutResult = await sut.handle(request).catch((e) => e)

    expect(sutResult).toStrictEqual(new InvalidCredentials())
  })

  test('Should throw InvalidCredentials if decryptResult is invalid', async () => {
    const { decrypter, sut } = makeSut()

    const decryptResult = { invalid: 'result' }
    decrypter.decrypt.mockReturnValueOnce(Promise.resolve(decryptResult))

    const request = { bearerToken: 'Bearer valid_bearerToken' }
    const sutResult = await sut.handle(request).catch((e) => e)

    expect(sutResult).toStrictEqual(new InvalidCredentials())
  })

  test('Should throw InvalidPermissions if an required role was not informed', async () => {
    const { decrypter, sut } = makeSut(['admin'])

    const decryptResult = makeSessionModelMock({ role: 'customer' })
    decrypter.decrypt.mockReturnValueOnce(Promise.resolve(decryptResult))

    const request = { bearerToken: 'Bearer valid_bearerToken' }
    const sutResult = await sut.handle(request).catch((e) => e)

    expect(sutResult).toStrictEqual(new InvalidPermissions())
  })
})
