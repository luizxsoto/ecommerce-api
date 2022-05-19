import { DbCreateCustomerUseCase } from '@/data/use-cases';
import { CustomerModel } from '@/domain/models';
import { ValidationException } from '@/infra/exceptions';
import { makeCustomerRepositoryStub } from '@tests/data/stubs/repositories';
import { makeValidatorServiceStub } from '@tests/data/stubs/services';

function makeSut() {
  const customerRepository = makeCustomerRepositoryStub();
  const validatorService = makeValidatorServiceStub();
  const sut = new DbCreateCustomerUseCase(customerRepository, customerRepository, validatorService);

  return { customerRepository, validatorService, sut };
}

describe(DbCreateCustomerUseCase.name, () => {
  test('Should create customer and return correct values', async () => {
    const { customerRepository, validatorService, sut } = makeSut();

    const requestModel = { name: 'Any Name', email: 'any@email.com', anyWrongProp: 'anyValue' };
    const sanitizedRequestModel = { ...requestModel };
    Reflect.deleteProperty(sanitizedRequestModel, 'anyWrongProp');
    const responseModel = { ...sanitizedRequestModel, id: 'any_id', createdAt: new Date() };
    const otherCustomer = { ...responseModel, email: 'valid@email.com' };

    customerRepository.findBy.mockReturnValueOnce([otherCustomer]);
    customerRepository.create.mockReturnValueOnce(responseModel);

    const sutResult = await sut.execute(requestModel);

    expect(sutResult).toStrictEqual(responseModel);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        name: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'name' }),
          validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
        email: [
          validatorService.rules.required(),
          validatorService.rules.string(),
          validatorService.rules.regex({ pattern: 'email' }),
          validatorService.rules.length({ minLength: 6, maxLength: 100 }),
        ],
      },
      model: sanitizedRequestModel,
      data: { customers: [] },
    });
    expect(customerRepository.findBy).toBeCalledWith([{ email: sanitizedRequestModel.email }]);
    expect(validatorService.validate).toBeCalledWith({
      schema: {
        name: [],
        email: [
          validatorService.rules.unique({
            dataEntity: 'customers',
            props: [{ modelKey: 'email', dataKey: 'email' }],
          }),
        ],
      },
      model: sanitizedRequestModel,
      data: { customers: [otherCustomer] },
    });
    expect(customerRepository.create).toBeCalledWith(sanitizedRequestModel);
  });

  describe.each([
    // name
    {
      properties: { name: undefined },
      validations: [{ field: 'name', rule: 'required', message: 'This value is required' }],
    },
    {
      properties: { name: 1 },
      validations: [{ field: 'name', rule: 'string', message: 'This value must be a string' }],
    },
    {
      properties: { name: ' InV@L1D n@m3 ' },
      validations: [
        {
          field: 'name',
          rule: 'regex',
          message: 'This value must be valid according to the pattern: name',
        },
      ],
    },
    {
      properties: { name: 'lower' },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 100' },
      ],
    },
    {
      properties: {
        name: 'Biggest Name Biggest Name Biggest Name Biggest Name Biggest Name Biggest Name Biggest Name Biggest Name',
      },
      validations: [
        { field: 'name', rule: 'length', message: 'This value length must be beetween 6 and 100' },
      ],
    },
    // email
    {
      properties: { email: undefined },
      validations: [{ field: 'email', rule: 'required', message: 'This value is required' }],
    },
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
    {
      properties: { email: 'valid@email.com' },
      validations: [
        { field: 'email', rule: 'unique', message: 'This value has already been used' },
      ],
    },
  ])(
    'Should throw ValidationException for every customer invalid prop',
    ({ properties, validations }) => {
      it(JSON.stringify(validations), async () => {
        const { customerRepository, sut } = makeSut();

        const requestModel = {
          name: 'Any Name',
          email: 'any@email.com',
          ...properties,
        } as CustomerModel;
        const responseModel = { ...requestModel, id: 'any_id', createdAt: new Date() };

        customerRepository.create.mockReturnValueOnce(responseModel);

        const sutResult = await sut.execute(requestModel).catch((e) => e);

        expect(sutResult).toStrictEqual(new ValidationException(validations));
      });
    },
  );
});
