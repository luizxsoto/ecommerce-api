import { ValidationService } from '@/data/contracts/services'
import { CreateOrderValidation } from '@/data/contracts/validations'
import { CreateOrderUseCase } from '@/domain/use-cases'
import { ValidationBuilder } from '@/main/builders'
import { MAX_ORDER_ITEMS_LENGTH, MAX_ORDER_ITEM_QUANTITY } from '@/main/constants'

export function makeCreateOrderValidation(
  validationService: ValidationService.Validator
): CreateOrderValidation {
  return async (requestModel: CreateOrderUseCase.RequestModel) => {
    await validationService.validate({
      schema: {
        orderItems: new ValidationBuilder()
          .required()
          .array(
            {
              validations: new ValidationBuilder()
                .object(
                  {
                    schema: {
                      productId: new ValidationBuilder()
                        .required()
                        .string()
                        .regex({ pattern: 'uuidV4' })
                        .build(),
                      quantity: new ValidationBuilder()
                        .required()
                        .integer()
                        .min({ value: 1 })
                        .max({ value: MAX_ORDER_ITEM_QUANTITY })
                        .build()
                    }
                  },
                  validationService
                )
                .build()
            },
            validationService
          )
          .distinct({ keys: ['productId'] })
          .length({ minLength: 1, maxLength: MAX_ORDER_ITEMS_LENGTH })
          .build()
      },
      model: requestModel,
      data: {}
    })
    return (validationData) =>
      validationService.validate({
        schema: {
          orderItems: new ValidationBuilder()
            .array(
              {
                validations: new ValidationBuilder()
                  .object(
                    {
                      schema: {
                        productId: new ValidationBuilder()
                          .exists({
                            dataEntity: 'products',
                            props: [{ modelKey: 'productId', dataKey: 'id' }]
                          })
                          .build()
                      }
                    },
                    validationService
                  )
                  .build()
              },
              validationService
            )
            .build()
        },
        model: requestModel,
        data: validationData
      })
  }
}
