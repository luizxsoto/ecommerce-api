import { Hasher } from '@/data/contracts/cryptography';
import { FindByUserRepository, UpdateUserRepository } from '@/data/contracts/repositories';
import { ValidatorService } from '@/data/contracts/services';
import { UserModel } from '@/domain/models';
import { UpdateUserUseCase } from '@/domain/use-cases';

export class DbUpdateUserUseCase implements UpdateUserUseCase.UseCase {
  constructor(
    private readonly updateUserRepository: UpdateUserRepository.Repository,
    private readonly findByUserRepository: FindByUserRepository.Repository,
    private readonly validator: ValidatorService.Validator<
      UpdateUserUseCase.RequestModel,
      { users: UserModel[] }
    >,
    private readonly hasher: Hasher,
  ) {}

  public async execute(
    requestModel: UpdateUserUseCase.RequestModel,
  ): Promise<UpdateUserUseCase.ResponseModel> {
    const sanitizedRequestModel = this.sanitizeRequestModel(requestModel);

    const restValidation = await this.validateRequestModel(sanitizedRequestModel);

    const filters: Partial<UserModel>[] = [{ id: sanitizedRequestModel.id }];

    if (sanitizedRequestModel.email) filters.push({ email: sanitizedRequestModel.email });

    const findedUsers = await this.findByUserRepository.findBy(filters);

    await restValidation({ users: [...findedUsers] });

    const repositoryResult = await this.updateUserRepository.update(
      { id: sanitizedRequestModel.id },
      {
        ...sanitizedRequestModel,
        password:
          sanitizedRequestModel.password &&
          (await this.hasher.hash(sanitizedRequestModel.password)),
      },
    );

    const findedUserById = findedUsers.find(
      (findedUser) => findedUser.id === sanitizedRequestModel.id,
    );

    return { ...findedUserById, ...sanitizedRequestModel, ...repositoryResult };
  }

  private sanitizeRequestModel(
    requestModel: UpdateUserUseCase.RequestModel,
  ): UpdateUserUseCase.RequestModel {
    return {
      id: requestModel.id,
      name: requestModel.name,
      email: requestModel.email,
      password: requestModel.password,
      roles: requestModel.roles,
    };
  }

  private async validateRequestModel(
    requestModel: UpdateUserUseCase.RequestModel,
  ): Promise<(validationData: { users: UserModel[] }) => Promise<void>> {
    await this.validator.validate({
      schema: {
        id: [
          this.validator.rules.required(),
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'uuidV4' }),
        ],
        name: [
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'name' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'email' }),
          this.validator.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        password: [
          this.validator.rules.string(),
          this.validator.rules.regex({ pattern: 'password' }),
          this.validator.rules.length({ minLength: 6, maxLength: 20 }),
        ],
        roles: [
          this.validator.rules.array({
            rules: [
              this.validator.rules.string(),
              this.validator.rules.in({ values: ['admin', 'moderator'] }),
            ],
          }),
        ],
      },
      model: requestModel,
      data: { users: [] },
    });
    return (validationData) =>
      this.validator.validate({
        schema: {
          id: [
            this.validator.rules.exists({
              dataEntity: 'users',
              props: [{ modelKey: 'id', dataKey: 'id' }],
            }),
          ],
          name: [],
          email: [
            this.validator.rules.unique({
              dataEntity: 'users',
              ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
              props: [{ modelKey: 'email', dataKey: 'email' }],
            }),
          ],
          password: [],
          roles: [],
        },
        model: requestModel,
        data: validationData,
      });
  }
}
