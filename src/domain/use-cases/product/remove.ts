import { ProductModel } from '@/domain/models'

export type RequestModel = { id: string }

export type ResponseModel = ProductModel

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>
}
