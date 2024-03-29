import { Role } from '@/domain/models'
import { JwtCryptography } from '@/infra/cryptography'
import { envConfig } from '@/main/config'
import { Middleware } from '@/presentation/contracts'
import { AuthMiddleware } from '@/presentation/middlewares'

export function makeAuthMiddleware(roles: Role[], isOptional?: boolean): Middleware {
  const jwtCryptography = new JwtCryptography(envConfig.jwtSecret)
  return new AuthMiddleware(jwtCryptography, roles, isOptional)
}
