/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import lodashGet from 'lodash.get';

import { ValidatorService } from '@/data/contracts/services';
import { Rule, Rules } from '@/data/contracts/services/validator';
import { ValidationException, ValidationItem } from '@/main/exceptions';

export class VanillaValidatorService<Model, ValidatorData extends Record<string, any[]>>
  implements ValidatorService.Validator<Model, ValidatorData>
{
  private validations: ValidationItem[] = [];

  private async performValidation(
    rules: Rule[],
    key: keyof Model,
    model: Model,
    data: ValidatorData,
  ) {
    for (const rule of rules) {
      const validation = await this.validationRules[rule.name](key, rule.options, model, data);

      if (validation) {
        this.validations.push(validation);
        break;
      }
    }
  }

  public async validate(
    params: ValidatorService.Params<Model, ValidatorData>,
  ): Promise<ValidatorService.Result> {
    await Promise.all(
      Object.keys(params.schema).map((key) =>
        this.performValidation(
          params.schema[key as keyof Model],
          key as keyof Model,
          params.model,
          params.data,
        ),
      ),
    );

    if (this.validations.length) throw new ValidationException(this.validations);
  }

  public rules: ValidatorService.Rules = {
    required: (options) => ({ name: 'required', options }),
    string: (options) => ({ name: 'string', options }),
    date: (options) => ({ name: 'date', options }),
    in: (options) => ({ name: 'in', options }),
    number: (options) => ({ name: 'number', options }),
    integer: (options) => ({ name: 'integer', options }),
    integerString: (options) => ({ name: 'integerString', options }),
    min: (options) => ({ name: 'min', options }),
    max: (options) => ({ name: 'max', options }),
    regex: (options) => ({ name: 'regex', options }),
    length: (options) => ({ name: 'length', options }),
    unique: (options) => ({ name: 'unique', options }),
    exists: (options) => ({ name: 'exists', options }),
    distinct: (options) => ({ name: 'distinct', options }),
    array: (options) => ({ name: 'array', options }),
    object: (options) => ({ name: 'object', options }),
    listFilters: (options) => ({ name: 'listFilters', options }),
    custom: (options) => ({ name: 'custom', options }),
  };

  private validationRules: Record<
    keyof ValidatorService.Rules,
    (
      key: keyof Model,
      options: any,
      model: ValidatorService.Params<Model, ValidatorData>['model'],
      data: ValidatorService.Params<Model, ValidatorData>['data'],
    ) => null | ValidationItem | Promise<null | ValidationItem>
  > = {
    required: (key, _options: Parameters<Rules['required']>[0], model) => {
      const value = lodashGet(model, key);
      if (value !== null && value !== undefined) return null;

      return {
        field: key as string,
        rule: 'required',
        message: 'This value is required',
      };
    },
    string: (key, _options: Parameters<Rules['string']>[0], model) => {
      const value = lodashGet(model, key);
      if (value === undefined || typeof value === 'string') return null;

      return {
        field: key as string,
        rule: 'string',
        message: 'This value must be a string',
      };
    },
    date: (key, _options: Parameters<Rules['date']>[0], model) => {
      const value = lodashGet(model, key);
      if (value === undefined) return null;

      const datePatterns = [
        /^(\d{3}[1-9]|\d{2}[1-9]\d)-([0][1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/,
        /^(\d{3}[1-9]|\d{2}[1-9]\d)-([0][1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])T([0-1]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{3}Z$/,
      ];
      if (typeof value !== 'string' || !datePatterns.some((datePattern) => datePattern.test(value)))
        return {
          field: key as string,
          rule: 'date',
          message: 'This value must be a valid date',
        };

      const [dateYear, dateMonth, dateDay] = new Date(value).toISOString().split(/-|T/);
      const [year, month, day] = value.split('-');

      if (dateYear !== year || dateMonth !== month || dateDay !== day)
        return {
          field: key as string,
          rule: 'date',
          message: 'This value must be a valid date',
        };

      return null;
    },
    in: (key, options: Parameters<Rules['in']>[0], model) => {
      const value = lodashGet(model, key);
      if (value === undefined || options.values.includes(value)) return null;

      return {
        field: key as string,
        rule: 'in',
        message: `This value must be in: ${options.values.join(', ')}`,
      };
    },
    number: (key, _options: Parameters<Rules['number']>[0], model) => {
      const value = lodashGet(model, key);
      if (value === undefined || typeof value === 'number') return null;

      return {
        field: key as string,
        rule: 'number',
        message: 'This value must be a number',
      };
    },
    integer: (key, _options: Parameters<Rules['integer']>[0], model) => {
      const value = lodashGet(model, key);
      const integerRgx = /^\d*$/;
      if (value === undefined || (typeof value === 'number' && integerRgx.test(String(value))))
        return null;

      return {
        field: key as string,
        rule: 'integer',
        message: 'This value must be an integer',
      };
    },
    integerString: (key, _options: Parameters<Rules['number']>[0], model) => {
      const value = lodashGet(model, key);
      const integerRgx = /^\d*$/;
      if (value === undefined || (typeof value === 'string' && integerRgx.test(value))) return null;

      return {
        field: key as string,
        rule: 'integerString',
        message: 'This value must be an integer in a string',
      };
    },
    min: (key, options: Parameters<Rules['min']>[0], model) => {
      const value = lodashGet(model, key);
      if (Number.isNaN(Number(value)) || value >= options.value) return null;

      return {
        field: key as string,
        rule: 'min',
        message: `This value must be bigger or equal to: ${options.value}`,
      };
    },
    max: (key, options: Parameters<Rules['max']>[0], model) => {
      const value = lodashGet(model, key);
      if (Number.isNaN(Number(value)) || value <= options.value) return null;

      return {
        field: key as string,
        rule: 'max',
        message: `This value must be less or equal to: ${options.value}`,
      };
    },
    regex: (key, options: Parameters<Rules['regex']>[0], model) => {
      const value = lodashGet(model, key);
      if (value === undefined) return null;

      const regexDict = {
        custom: options.customPattern ?? /^\w$/,
        name: /^([a-zA-Z\u00C0-\u00FF]+\s)*[a-zA-Z\u00C0-\u00FF]+$/,
        email: /^[\w+.]+@\w+\.\w{2,}(?:\.\w{2})?$/,
        password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        uuidV4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
        url: /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/gi,
      };

      if (typeof value !== 'string' || !regexDict[options.pattern].test(value))
        return {
          field: key as string,
          rule: 'regex',
          message: `This value must be valid according to the pattern: ${
            options.customPattern ?? options.pattern
          }`,
        };

      return null;
    },
    length: (key, options: Parameters<Rules['length']>[0], model) => {
      const value = lodashGet(model, key);
      if (value === undefined || (typeof value !== 'string' && !Array.isArray(value))) return null;

      const parsedValue = value as string | any[];

      if (parsedValue.length < options.minLength || parsedValue.length > options.maxLength) {
        return {
          field: key as string,
          rule: 'length',
          message: `This value length must be beetween ${options.minLength} and ${options.maxLength}`,
        };
      }

      return null;
    },
    unique: (key, options: Parameters<Rules['unique']>[0], model, data) => {
      const value = lodashGet(model, key);
      if (value === undefined) return null;

      const registerFinded = data[options.dataEntity].find((dataItem) =>
        options.props.every((prop) => {
          let modelKey = (key as string).split('.').slice(0, -1).join('.');
          modelKey += modelKey ? `.${prop.modelKey}` : prop.modelKey;
          return lodashGet(dataItem, prop.dataKey) === lodashGet(model, modelKey);
        }),
      );

      const isSameIgnoreProps =
        registerFinded &&
        options.ignoreProps?.every((ignoreProp) => {
          let modelKey = (key as string).split('.').slice(0, -1).join('.');
          modelKey += modelKey ? `.${ignoreProp.modelKey}` : ignoreProp.modelKey;
          return lodashGet(registerFinded, ignoreProp.dataKey) === lodashGet(model, modelKey);
        });

      if (!registerFinded || isSameIgnoreProps) return null;

      return {
        field: key as string,
        rule: 'unique',
        message: 'This value has already been used',
      };
    },
    exists: (key, options: Parameters<Rules['exists']>[0], model, data) => {
      const value = lodashGet(model, key);
      if (value === undefined) return null;

      const registerFinded = data[options.dataEntity].find((dataItem) =>
        options.props.every((prop) => {
          let modelKey = (key as string).split('.').slice(0, -1).join('.');
          modelKey += modelKey ? `.${prop.modelKey}` : prop.modelKey;
          return lodashGet(dataItem, prop.dataKey) === lodashGet(model, modelKey);
        }),
      );

      if (registerFinded) return null;

      return {
        field: key as string,
        rule: 'exists',
        message: 'This value was not found',
      };
    },
    distinct: (key, options: Parameters<Rules['distinct']>[0], model) => {
      const value = lodashGet(model, key);
      if (value === undefined || !Array.isArray(value)) return null;

      const hasDuplicatedValue = value.some(
        (valueItem) =>
          value.filter((otherValueItem) =>
            !options.keys
              ? valueItem === otherValueItem
              : options.keys.every(
                  (keyItem) => lodashGet(otherValueItem, keyItem) === lodashGet(valueItem, keyItem),
                ),
          ).length > 1,
      );

      if (!hasDuplicatedValue) return null;

      return {
        field: key as string,
        rule: 'distinct',
        message: `This value cannot have duplicate items${
          !options.keys ? '' : ` by: ${options.keys.join(', ')}`
        }`,
      };
    },
    array: async (key, options: Parameters<Rules['array']>[0], model, data) => {
      const value = lodashGet(model, key);
      if (value === undefined) return null;

      if (!Array.isArray(value))
        return {
          field: key as string,
          rule: 'array',
          message: 'This value must be an array',
        };

      await Promise.all(
        value.map((_, index) =>
          this.performValidation(
            options.rules,
            `${String(key)}.${index}` as keyof Model,
            model,
            data,
          ),
        ),
      );

      return null;
    },
    object: async (key, options: Parameters<Rules['object']>[0], model, data) => {
      const value = lodashGet(model, key);
      if (value === undefined) return null;

      if (typeof value !== 'object' || Array.isArray(value))
        return {
          field: key as string,
          rule: 'object',
          message: 'This value must be an object',
        };

      const parsedSchema = {} as Record<keyof Model, Rule[]>;

      Object.keys(options.schema).forEach((nestedKey) => {
        parsedSchema[`${String(key)}.${nestedKey}` as keyof Model] = options.schema[nestedKey];
      });

      await this.validate({ model, schema: parsedSchema, data });

      return null;
    },
    listFilters: async (key, options: Parameters<Rules['listFilters']>[0], model, data) => {
      const value = lodashGet(model, key);
      if (value === undefined) return null;

      type PrimitiveType = string | number;
      type FilterType = [PrimitiveType, PrimitiveType, PrimitiveType | PrimitiveType[]];
      type OperatorType = [string, ...(OperatorType | FilterType)[]];

      let arrayValue!: OperatorType;

      const posibleFields = Object.keys(options.schema);
      const validationError = {
        field: key as string,
        rule: 'listFilters',
        message: `This value must be a valid list filters and with this posible fields: ${posibleFields.join(
          ', ',
        )}`,
      };

      try {
        arrayValue = JSON.parse(value.replace(/'/g, "''"));
      } catch {
        return validationError;
      }

      if (!Array.isArray(arrayValue)) return validationError;
      if (!arrayValue.length) return null;

      const filters = {} as Record<keyof Model, PrimitiveType[]>;
      posibleFields.forEach((posibleField) => {
        filters[posibleField as keyof Model] = [] as PrimitiveType[];
      });

      function addValueToModel(
        operator: string,
        fieldOrFilter: OperatorType | FilterType,
        values: OperatorType | FilterType,
      ) {
        const filterOperators = ['&', '|'];
        const isFieldOperator =
          typeof fieldOrFilter === 'string' && !filterOperators.includes(operator as string);

        if (isFieldOperator) {
          const valuesToPush = (Array.isArray(values) ? values : [values]) as PrimitiveType[];

          filters[fieldOrFilter as keyof Model].push(...valuesToPush);
        }
      }

      const operatorsValidationDict: Record<string, (item: OperatorType | FilterType) => boolean> =
        {
          '&': (item: OperatorType | FilterType) => {
            const [, ...restItems] = item;

            const isAllRestItemsValid = (restItems as (OperatorType | FilterType)[]).every(
              (restItem) => {
                if (!Array.isArray(restItem) || !restItem.length) return false;

                const [operator, fieldOrFilter, values] = restItem;

                if (!operatorsValidationDict[operator]?.(restItem)) return false;

                addValueToModel(
                  operator as string,
                  fieldOrFilter as OperatorType | FilterType,
                  values as OperatorType | FilterType,
                );

                return true;
              },
            );

            return isAllRestItemsValid && !!restItems.length;
          },
          '|': (item: OperatorType | FilterType) => operatorsValidationDict['&'](item),
          '=': (item: OperatorType | FilterType) => {
            const [, field, values] = item;

            if (
              typeof field !== 'string' ||
              !posibleFields.includes(field) ||
              (typeof values !== 'string' && typeof values !== 'number')
            ) {
              return false;
            }

            return true;
          },
          '!=': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
          '>': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
          '>=': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
          '<': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
          '<=': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
          ':': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
          '!:': (item: OperatorType | FilterType) => operatorsValidationDict['='](item),
          in: (item: OperatorType | FilterType) => {
            const [, field, values] = item;

            if (
              typeof field !== 'string' ||
              !posibleFields.includes(field) ||
              !Array.isArray(values) ||
              (values as []).some(
                (valuesItem) => typeof valuesItem !== 'string' && typeof valuesItem !== 'number',
              )
            ) {
              return false;
            }

            return true;
          },
        };

      const [operator, fieldOrFilter, values] = arrayValue;

      if (!operatorsValidationDict[operator]?.(arrayValue)) return validationError;

      addValueToModel(operator, fieldOrFilter, values);

      return this.validationRules.object(
        'filters' as keyof Model,
        options,
        { filters } as unknown as Model,
        data,
      );
    },
    custom: async (key, options: Parameters<Rules['custom']>[0]) => {
      if (await options.validation()) return null;

      return {
        field: key as string,
        rule: options.rule,
        message: options.message,
      };
    },
  };
}
