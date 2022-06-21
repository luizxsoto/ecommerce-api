import { CustomerModel } from '@/domain/models';

export type RequestModel = Omit<
  CustomerModel,
  'id' | 'createUserId' | 'updateUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

export type ResponseModel = CustomerModel;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}
