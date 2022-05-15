import { DbUpdateCustomerUseCase } from '@/data/use-cases';
import { CustomerModel } from '@/domain/models';
import { ValidationException } from '@/infra/exceptions';
import { makeCustomerRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

const validUuidV4 = '00000000-0000-4000-8000-000000000001';

function makeSut() {
  const customerRepository = makeCustomerRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbUpdateCustomerUseCase(customerRepository, customerRepository, validatorService);

  return { customerRepository, validatorService, sut };
}

describe(DbUpdateCustomerUseCase.name, () => {
  test('Should update customer and return correct values', async () => {
    const { customerRepository, validatorService, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      email: 'any@email.com',
      anyWrongProp: 'anyValue',
    };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel, updatedAt: new Date() };
    const existsCustomer = { ...responseModel };
    const otherCustomer = { ...responseModel, email: 'valid@email.com' };

    customerRepository.findBy.mockReturnValueOnce([existsCustomer]);
    customerRepository.findBy.mockReturnValueOnce([otherCustomer]);
    customerRepository.update.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel).catch();

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'uuidV4' }),
        ],
        name: [
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'name' }),
          validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'email' }),
          validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
      },
      model: sanitizedRequestModel,
      data: { customers: [] },
    });
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        id: [
          validatorService.rules.exists({
            dataEntity: 'customers',
            props: [{ modelKey: 'id', dataKey: 'id' }],
          }),
        ],
        name: [],
        email: [
          validatorService.rules.unique({
            dataEntity: 'customers',
            ignoreProps: [{ modelKey: 'id', dataKey: 'id' }],
            props: [{ modelKey: 'email', dataKey: 'email' }],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { customers: [existsCustomer, otherCustomer] },
    });
    expect(customerRepository.findBy).toBeCalledWith({ id: sanitizedRequestModel.id });
    expect(customerRepository.findBy).toBeCalledWith({ email: sanitizedRequestModel.email });
    expect(customerRepository.update).toBeCalledWith(
      { id: sanitizedRequestModel.id },
      sanitizedRequestModel,
    );
  });

  describe.each([
    // id
    {
      properties: { id: undefined, email: 'any@email.com' },
      validations: [{ field: 'id', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { id: 1, email: 'any@email.com' },
      validations: [{ field: 'id', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { id: 'invalid_uuid', email: 'any@email.com' },
      validations: [
        {
          field: 'id',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: uuidV4',
        },
      ],
    },
    // name
    {
      properties: { name: 1, email: 'any@email.com' },
      validations: [{ field: 'name', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { name: ' InV@L1D n@m3 ', email: 'any@email.com' },
      validations: [
        {
          field: 'name',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: name',
        },
      ],
    },
    {
      properties: { name: 'lower', email: 'any@email.com' },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 100' },
      ],
    },
    {
      properties: {
        name: 'BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName BiggestName',
        email: 'any@email.com',
      },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 100' },
      ],
    },
    // email
    {
      properties: { email: 1 },
      validations: [{ field: 'email', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { email: ' InV@L1D eM@1L ' },
      validations: [
        {
          field: 'email',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: email',
        },
      ],
    },
    {
      properties: {
        email:
          'biggest_email_biggest_email_biggest_email_biggest_email_biggest_email_biggest_email_biggest_email@invalid.com',
      },
      validations: [
        { field: 'email', rule: 'length', message: 'This value length must be beetween 6 and 100' },
      ],
    },
  ])(
    'Should throw ValidationException for every customer invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { customerRepository, sut } = makeSut();

        // eslint-disable-next-line prefer-object-spread
        const requestModel: CustomerModel = Object.assign(
          { id: validUuidV4, name: 'Any Name', email: 'any@email.com' },
          properties,
        );
        const responseModel = { ...requestModel, updatedAt: new Date() };

        customerRepository.findBy.mockReturnValueOnce([responseModel]);
        customerRepository.update.mockReturnValueOnce(responseModel);

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );

  test('Should throw ValidationException if id was not found', async () => {
    const { customerRepository, sut } = makeSut();

    const requestModel = {
      id: '00000000-0000-4000-8000-000000000002',
      name: 'Any Name',
      email: 'any@email.com',
    };
    const responseModel = { ...requestModel, updatedAt: new Date() };

    customerRepository.findBy.mockReturnValueOnce([
      { ...responseModel, id: validUuidV4, email: 'other@email.com' },
    ]);
    customerRepository.update.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel).catch((e) => e);

    expect(sutResult).toStrictEqual(
      new ValidationException([
        { field: 'id', rule: 'exists', message: 'This value was not found' },
      ]),
    );
  });

  test('Should throw ValidationException if email is already used', async () => {
    const { customerRepository, sut } = makeSut();

    const requestModel = {
      id: validUuidV4,
      name: 'Any Name',
      email: 'any@email.com',
    };
    const responseModel = { ...requestModel, updatedAt: new Date() };

    customerRepository.findBy.mockReturnValueOnce([{ ...responseModel, email: 'other@email.com' }]);
    customerRepository.findBy.mockReturnValueOnce([
      { ...responseModel, id: '00000000-0000-4000-8000-000000000002' },
    ]);
    customerRepository.update.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel).catch((e) => e);

    expect(sutResult).toStrictEqual(
      new ValidationException([
        { field: 'email', rule: 'unique', message: 'This value has already been used' },
      ]),
    );
  });
});