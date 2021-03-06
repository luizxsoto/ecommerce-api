import {
  CreateOrderRepository,
  FindByOrderRepository,
  ListOrderRepository,
  RemoveOrderRepository,
  UpdateOrderRepository,
} from '@/data/contracts/repositories';
import { makeOrderModelMock } from '@tests/domain/mocks/models';

export function makeOrderRepositoryStub() {
  return {
    findBy: jest
      .fn()
      .mockImplementation((): FindByOrderRepository.ResponseModel => [makeOrderModelMock()]),
    list: jest
      .fn()
      .mockImplementation((): ListOrderRepository.ResponseModel => [makeOrderModelMock()]),
    create: jest
      .fn()
      .mockImplementation(
        (requestModel: CreateOrderRepository.RequestModel): CreateOrderRepository.ResponseModel =>
          makeOrderModelMock(requestModel),
      ),
    update: jest
      .fn()
      .mockImplementation(
        (requestModel: UpdateOrderRepository.RequestModel): UpdateOrderRepository.ResponseModel => [
          makeOrderModelMock(requestModel[1]),
        ],
      ),
    remove: jest
      .fn()
      .mockImplementation(
        (requestModel: RemoveOrderRepository.RequestModel): RemoveOrderRepository.ResponseModel => [
          makeOrderModelMock(requestModel[0]),
        ],
      ),
  };
}
