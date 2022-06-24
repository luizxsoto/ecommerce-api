import { DbCreatePaymentProfileUseCase } from '@/data/use-cases';
import { CustomerModel, PaymentProfileModel, SessionModel } from '@/domain/models';
import { CreatePaymentProfileUseCase } from '@/domain/use-cases';
import { KnexCustomerRepository, KnexPaymentProfileRepository } from '@/infra/repositories';
import { UUIDService } from '@/infra/services';
import { VanillaValidatorService } from '@/infra/services/validator';
import { knexConfig } from '@/main/config';

export function makeDbCreatePaymentProfileUseCase(
  session: SessionModel,
): CreatePaymentProfileUseCase.UseCase {
  const repository = new KnexPaymentProfileRepository(session, knexConfig, new UUIDService());
  const customerRepository = new KnexCustomerRepository(session, knexConfig, new UUIDService());
  const validatorService = new VanillaValidatorService<
    Omit<CreatePaymentProfileUseCase.RequestModel, 'data'> & {
      data: string | PaymentProfileModel['data'];
    },
    {
      customers: CustomerModel[];
      paymentProfiles: (Omit<PaymentProfileModel, 'data'> & { data: string })[];
    }
  >();
  const useCase = new DbCreatePaymentProfileUseCase(
    repository,
    repository,
    customerRepository,
    validatorService,
  );

  return useCase;
}
