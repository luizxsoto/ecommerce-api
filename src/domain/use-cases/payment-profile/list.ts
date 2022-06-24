import { PaymentProfileModel } from '@/domain/models';

export type RequestModel = {
  page?: number;
  perPage?: number;
  orderBy?: 'name' | 'email' | 'createdAt' | 'updatedAt';
  order?: 'asc' | 'desc';
  filters?: string;
};

export type ResponseModel = PaymentProfileModel[];

export interface UseCase {
  execute: (requestModel: RequestModel) => Promise<ResponseModel>;
}
