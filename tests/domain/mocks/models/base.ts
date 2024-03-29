import { BaseModel } from '@/domain/models'

const validUuidV4 = '00000000-0000-4000-8000-000000000001'

export function makeBaseModelMock(extraData?: Partial<BaseModel>) {
  return {
    id: validUuidV4,
    createUserId: validUuidV4,
    createdAt: new Date(),
    ...extraData
  }
}
