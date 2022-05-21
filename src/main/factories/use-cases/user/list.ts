import { DbListUserUseCase } from '@/data/use-cases';
import { UserModel } from '@/domain/models';
import { ListUserUseCase } from '@/domain/use-cases';
import { KnexUserRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbListUserUseCase(): ListUserUseCase.UseCase {
  const repository = new KnexUserRepository(knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    Partial<ListUserUseCase.RequestModel>,
    { users: UserModel[] }
  >();
  const useCase = new DbListUserUseCase(repository, validatorService);

  return useCase;
}