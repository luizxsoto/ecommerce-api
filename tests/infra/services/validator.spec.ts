import { VanillaValidatorService } from '@/infra/services/validator';
import { ValidationException } from '@/main/exceptions';

function makeSut() {
  const sut = new VanillaValidatorService();

  return { sut };
}

describe(VanillaValidatorService.name, () => {
  describe('Should throw if a required value was not informed', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.required()] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'required', message: 'This value is required' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.required()] },
          model: { anyProp: 'anyProp' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value should be string, but is not', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.string()] },
          model: { anyProp: 1 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'string', message: 'This value must be a string' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.string()] },
          model: { anyProp: 'anyProp' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.string()] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value should be in, but is not', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.in({ values: ['anyValue', 'otherAnyValue'] })] },
          model: { anyProp: 'someValue' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'in',
            message: 'This value must be in: anyValue, otherAnyValue',
          },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.in({ values: ['anyValue'] })] },
          model: { anyProp: 'anyValue' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.in({ values: ['anyValue'] })] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value should be number, but is not', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.number()] },
          model: { anyProp: 'anyProp' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'number', message: 'This value must be a number' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.number()] },
          model: { anyProp: 1 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.number()] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value is not bigger than necessary', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.min({ value: 2 })] },
          model: { anyProp: 1 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'min', message: 'This value must be bigger than: 2' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.min({ value: 2 })] },
          model: { anyProp: 2 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.min({ value: 2 })] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value is not smaller than necessary', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.max({ value: 2 })] },
          model: { anyProp: 3 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'max', message: 'This value must be smaller than: 2' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.max({ value: 2 })] },
          model: { anyProp: 2 },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.max({ value: 2 })] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value should match with a regex, but is not', () => {
    test('regex: custom', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [sut.rules.regex({ pattern: 'custom', customPattern: /customPattern/ })],
          },
          model: { anyProp: 'invalid_custom' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: /customPattern/',
          },
        ]),
      );
    });

    test('regex: name', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'name' })] },
          model: { anyProp: ' iNv@l1 -_- n@m3 ' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: name',
          },
        ]),
      );
    });

    test('regex: email', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'email' })] },
          model: { anyProp: 'invalid_email' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: email',
          },
        ]),
      );
    });

    test('regex: password', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'password' })] },
          model: { anyProp: 'invalid_password' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: password',
          },
        ]),
      );
    });

    test('regex: uuidV4', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'uuidV4' })] },
          model: { anyProp: 'invalid_uuidV4' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'regex',
            message: 'This value must be valid according to the pattern: uuidV4',
          },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'name' })] },
          model: { anyProp: 'Any Prop' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.regex({ pattern: 'name' })] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value is out of length', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.length({ minLength: 6, maxLength: 22 })] },
          model: { anyProp: 'lowerOrBiggerThenLength' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          {
            field: 'anyProp',
            rule: 'length',
            message: 'This value length must be beetween 6 and 22',
          },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.length({ minLength: 6, maxLength: 13 })] },
          model: { anyProp: 'correctLength' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: { anyProp: [sut.rules.length({ minLength: 6, maxLength: 13 })] },
          model: { anyProp: undefined },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value has already been used', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.unique({
                dataEntity: 'anyData',
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: 'anyProp' },
          data: { anyData: [{ anyProp: 'anyProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'unique', message: 'This value has already been used' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.unique({
                dataEntity: 'anyData',
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: 'anyOtherProp' },
          data: { anyData: [{ anyProp: 'anyProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if isSameIgnoreProps', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.unique({
                dataEntity: 'anyData',
                ignoreProps: [{ modelKey: 'otherProp', dataKey: 'otherProp' }],
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: 'anyProp', otherProp: 'otherProp' },
          data: { anyData: [{ anyProp: 'anyProp', otherProp: 'otherProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.unique({
                dataEntity: 'anyData',
                ignoreProps: [{ modelKey: 'otherProp', dataKey: 'otherProp' }],
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: undefined, otherProp: undefined },
          data: { anyData: [{ anyProp: 'anyProp', otherProp: 'otherProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if the value was not found', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.exists({
                dataEntity: 'anyData',
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: 'anyOtherProp' },
          data: { anyData: [{ anyProp: 'anyProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'exists', message: 'This value was not found' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.exists({
                dataEntity: 'anyData',
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: 'anyProp' },
          data: { anyData: [{ anyProp: 'anyProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });

    test('Should not throw if is not informed a value', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.exists({
                dataEntity: 'anyData',
                props: [{ modelKey: 'anyProp', dataKey: 'anyProp' }],
              }),
            ],
          },
          model: { anyProp: undefined },
          data: { anyData: [{ anyProp: 'anyProp' }] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });

  describe('Should throw if custom validation returns false', () => {
    test('Should throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.custom({
                validation: () => Promise.resolve(false),
                rule: 'custom',
                message: 'Custom error message',
              }),
            ],
          },
          model: { anyProp: 'anyProp' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toStrictEqual(
        new ValidationException([
          { field: 'anyProp', rule: 'custom', message: 'Custom error message' },
        ]),
      );
    });

    test('Should not throw', async () => {
      const { sut } = makeSut();

      const sutResult = await sut
        .validate({
          schema: {
            anyProp: [
              sut.rules.custom({
                validation: () => Promise.resolve(true),
                rule: 'custom',
                message: 'Custom error message',
              }),
            ],
          },
          model: { anyProp: 'anyProp' },
          data: { anyData: [] },
        })
        .catch((e) => e);

      expect(sutResult).toBeUndefined();
    });
  });
});
