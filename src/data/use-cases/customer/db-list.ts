import { MAX_PER_PAGE, MIN_PER_PAGE } from '@/data/constants';
import { ListCustomerRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { CustomerModel } from '@/domain/models';
import { ListCustomerUseCase } from '@/domain/use-cases';

export class DbListCustomerUseCase implements ListCustomerUseCase.UseCase {
  constructor(
    private readonly listCustomerRepository: ListCustomerRepository.Repository,
    private readonly validatorService: ValidatorService.Validator<
      ListCustomerUseCase.RequestModel,
      Record<string, unknown[]>
    >,
  ) {}

  public async execute(
    requestModel: ListCustomerUseCase.RequestModel,
  ): Promise<ListCustomerUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    await this.validateRequestModel(sanitizedRequestModel);

    const customers = await this.listCustomerRepository.list(sanitizedRequestModel);

    return customers;
  }

  private sanitizeRequestModel(
    requestModel: ListCustomerUseCase.RequestModel,
  ): ListCustomerUseCase.RequestModel {
    const sanitizedRequestModel: ListCustomerUseCase.RequestModel = {
      page: Number(requestModel.page) || requestModel.page,
      perPage: Number(requestModel.perPage) || requestModel.perPage,
      orderBy: requestModel.orderBy,
      order: requestModel.order,
      filters: requestModel.filters,
    };

    return sanitizedRequestModel;
  }

  private async validateRequestModel(
    requestModel: ListCustomerUseCase.RequestModel,
  ): Promise<void> {
    await this.validatorService.validate({
      schema: {
        page: [
          this.validatorService.rules.integer(),
          this.validatorService.rules.min({ value: 1 }),
        ],
        perPage: [
          this.validatorService.rules.integer(),
          this.validatorService.rules.min({ value: MIN_PER_PAGE }),
          this.validatorService.rules.max({ value: MAX_PER_PAGE }),
        ],
        orderBy: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['name', 'email', 'createdAt', 'updatedAt'] }),
        ],
        order: [
          this.validatorService.rules.string(),
          this.validatorService.rules.in({ values: ['asc', 'desc'] }),
        ],
        filters: [
          this.validatorService.rules.listFilters<
            Omit<CustomerModel, 'id' | 'deleteUserId' | 'deletedAt'>
          >({
            schema: {
              name: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'name' }),
                    this.validatorService.rules.length({ minLength: 6, maxLength: 100 }),
                  ],
                }),
              ],
              email: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'email' }),
                    this.validatorService.rules.length({ minLength: 6, maxLength: 100 }),
                  ],
                }),
              ],
              createUserId: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              updateUserId: [
                this.validatorService.rules.array({
                  rules: [
                    this.validatorService.rules.string(),
                    this.validatorService.rules.regex({ pattern: 'uuidV4' }),
                  ],
                }),
              ],
              createdAt: [
                this.validatorService.rules.array({
                  rules: [this.validatorService.rules.string(), this.validatorService.rules.date()],
                }),
              ],
              updatedAt: [
                this.validatorService.rules.array({
                  rules: [this.validatorService.rules.string(), this.validatorService.rules.date()],
                }),
              ],
            },
          }),
        ],
      },
      model: requestModel,
      data: {},
    });
  }
}
