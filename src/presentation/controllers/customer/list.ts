import { ListCustomerUseCase } from '@/domain/use-cases';
import { Controller, HttpResponse } from '@/presentation/contracts';
import { ListCustomerDto } from '@/presentation/dtos';
import { ok } from '@/presentation/helpers';

export class ListCustomerController implements Controller<ListCustomerDto> {
  constructor(private readonly listCustomerUseCase: ListCustomerUseCase.UseCase) {}

  public async handle(params: ListCustomerDto): Promise<HttpResponse> {
    const useCaseResult = await this.listCustomerUseCase.execute(params);

    return ok(useCaseResult);
  }
}