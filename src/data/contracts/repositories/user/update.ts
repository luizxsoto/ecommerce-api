import { UserModel } from '@/domain/models'

export type RequestModel = Parameters<
  (
    where: Partial<UserModel>,
    model: Partial<
      Omit<
        UserModel,
        | 'id'
        | 'createUserId'
        | 'updateUserId'
        | 'deleteUserId'
        | 'createdAt'
        | 'updatedAt'
        | 'deletedAt'
      >
    >
  ) => void
>

export type ResponseModel = UserModel[]

export interface Repository {
  update: (...requestModel: RequestModel) => Promise<ResponseModel>
}
