import { OrderModel } from '@/domain/models';

export type RequestModel = {
  page?: number;
  perPage?: number;
  orderBy?: 'userId' | 'paymentProfileId' | 'totalValue' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
  filters?: string;
};

export type ResponseModel = OrderModel[];

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}
