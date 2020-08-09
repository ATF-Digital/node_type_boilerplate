import AppError from '@shared/errors/AppError';

import { inject, injectable } from 'tsyringe';
import IEnterprisesRepository from '@modules/enterprises/repositories/IEnterprisesRepository';
import Service from '../infra/typeorm/entities/Service';
import IServiceRepository from '../repositories/IServiceRepository';

interface IRequest {
  service_id: string;
  user_id: string;
}

@injectable()
class DeleteServiceService {
  constructor(
    @inject('EnterprisesRepository')
    private enterprisesRepository: IEnterprisesRepository,

    @inject('ServiceRepository')
    private serviceRepository: IServiceRepository,
  ) {}

  public async execute({
    service_id,
    user_id,
  }: IRequest): Promise<Service | undefined> {
    const service = await this.serviceRepository.findById(service_id);

    if (!service) {
      throw new AppError('Este serviço não existe');
    }

    if (service?.enterprise.owner_id !== user_id) {
      throw new AppError('Você não é o dono da empresa');
    }

    const serviceDescription = await this.serviceRepository.delete(service);

    return serviceDescription;
  }
}

export default DeleteServiceService;
