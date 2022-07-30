import { MAX_INTEGER, MAX_PRODUCT_NAME_LENGTH, MIN_PRODUCT_NAME_LENGTH } from '@/main/constants'

export const baseProduct = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      example: 'Any Name',
      minLength: MIN_PRODUCT_NAME_LENGTH,
      maxLength: MAX_PRODUCT_NAME_LENGTH
    },
    category: { $ref: '#/schemas/productCategory', example: 'others' },
    image: { type: 'string', example: 'https://avatars.githubusercontent.com/u/37672408' },
    price: { type: 'integer', example: 100, maximum: MAX_INTEGER }
  }
}

export const product = {
  allOf: [{ $ref: '#/schemas/base' }, { $ref: '#/schemas/baseProduct' }]
}
