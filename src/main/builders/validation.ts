import { ValidationService } from '@/data/contracts/services'
import { FieldValidation } from '@/validation/protocols'
import {
  ArrayValidation,
  CustomValidation,
  DateValidation,
  DistinctValidation,
  ExistsValidation,
  InValidation,
  IntegerValidation,
  LengthValidation,
  ListFiltersValidation,
  MaxValidation,
  MinValidation,
  ObjectValidation,
  RegexValidation,
  RequiredValidation,
  StringValidation,
  UniqueValidation
} from '@/validation/validators'

export class ValidationBuilder {
  private validations: FieldValidation.Validation[] = []

  public build(): FieldValidation.Validation[] {
    return this.validations
  }

  public array(
    options: ArrayValidation.Options,
    validationService: ValidationService.Validator
  ): ValidationBuilder {
    this.validations.push(new ArrayValidation.Validator(options, validationService))
    return this
  }

  public custom(options: CustomValidation.Options): ValidationBuilder {
    this.validations.push(new CustomValidation.Validator(options))
    return this
  }

  public date(options?: DateValidation.Options): ValidationBuilder {
    this.validations.push(new DateValidation.Validator(options))
    return this
  }

  public distinct(options?: DistinctValidation.Options): ValidationBuilder {
    this.validations.push(new DistinctValidation.Validator(options))
    return this
  }

  public exists(options: ExistsValidation.Options): ValidationBuilder {
    this.validations.push(new ExistsValidation.Validator(options))
    return this
  }

  public in(options: InValidation.Options): ValidationBuilder {
    this.validations.push(new InValidation.Validator(options))
    return this
  }

  public integer(options?: IntegerValidation.Options): ValidationBuilder {
    this.validations.push(new IntegerValidation.Validator(options))
    return this
  }

  public length(options: LengthValidation.Options): ValidationBuilder {
    this.validations.push(new LengthValidation.Validator(options))
    return this
  }

  public listFilers(
    options: ListFiltersValidation.Options,
    objectValidation: ObjectValidation.Validator
  ): ValidationBuilder {
    this.validations.push(new ListFiltersValidation.Validator(options, objectValidation))
    return this
  }

  public max(options: MaxValidation.Options): ValidationBuilder {
    this.validations.push(new MaxValidation.Validator(options))
    return this
  }

  public min(options: MinValidation.Options): ValidationBuilder {
    this.validations.push(new MinValidation.Validator(options))
    return this
  }

  public object(
    options: ObjectValidation.Options,
    validationService: ValidationService.Validator
  ): ValidationBuilder {
    this.validations.push(new ObjectValidation.Validator(options, validationService))
    return this
  }

  public regex(options: RegexValidation.Options): ValidationBuilder {
    this.validations.push(new RegexValidation.Validator(options))
    return this
  }

  public required(options?: RequiredValidation.Options): ValidationBuilder {
    this.validations.push(new RequiredValidation.Validator(options))
    return this
  }

  public string(options?: StringValidation.Options): ValidationBuilder {
    this.validations.push(new StringValidation.Validator(options))
    return this
  }

  public unique(options: UniqueValidation.Options): ValidationBuilder {
    this.validations.push(new UniqueValidation.Validator(options))
    return this
  }
}
