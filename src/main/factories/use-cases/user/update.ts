import { DbUpdateUserUseCase } from '@/data/use-cases';
import { SessionModel, UserModel } from '@/domain/models';
import { UpdateUserUseCase } from '@/domain/use-cases';
import { BcryptCryptography } from '@/infra/cryptography';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbUpdateUserUseCase(session: SessionModel): UpdateUserUseCase.UseCase {
  const repository = new KnexUserRepository(knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    UpdateUserUseCase.RequestModel,
    { users: UserModel[] }
  >();
  const salt = 12;
  const bcryptCryptography = new BcryptCryptography(salt);
  const useCase = new DbUpdateUserUseCase(
    session,
    repository,
    repository,
    validatorService,
    bcryptCryptography,
  );

  return useCase;
}
