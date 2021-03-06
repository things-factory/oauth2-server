import { getRepository } from 'typeorm'
import { Application, ApplicationStatus } from '../../../entities'

export const createApplication = {
  async createApplication(_: any, { application }, context: any) {
    return await getRepository(Application).save({
      ...application,
      appKey: Application.generateAppKey(),
      appSecret: Application.generateAppSecret(),
      creator: context.state.user,
      updater: context.state.user
    })
  }
}
