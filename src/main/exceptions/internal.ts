import { ApplicationException } from './application';

export class InternalException extends ApplicationException {
  constructor(error: Error) {
    super({
      name: 'InternalException',
      code: 'E_INTERNAL_EXCEPTION',
      message: 'Something went wrong',
      originalError: error,
    });
  }
}