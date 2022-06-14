import { CustomerModel } from '@/domain/models';

export type RequestModel = { id: string } & Partial<
  Omit<CustomerModel, 'id' | 'createUserId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>;

export type ResponseModel = CustomerModel;

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}
