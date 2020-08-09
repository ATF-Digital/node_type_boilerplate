import AppError from '@shared/errors/AppError';

import { inject, injectable } from 'tsyringe';
import Enterprises from '../infra/typeorm/entities/Enterprises';
import IEnterprisesRepository from '../repositories/IEnterprisesRepository';

interface IRequest {
  name: string;
  area: string;
  address: string;
  open_hour: string;
  close_hour: string;
  primary_color: string;
  secondary_color: string;
  isPrivate: number;
  owner_id: string;
}

@injectable()
class UpdateEnterpriseService {
  constructor(
    @inject('EnterprisesRepository')
    private enterprisesRepository: IEnterprisesRepository,
  ) {}

  public async execute({
    name,
    area,
    address,
    open_hour,
    close_hour,
    primary_color,
    secondary_color,
    isPrivate,
    owner_id,
  }: IRequest): Promise<Enterprises> {
    const myEnterprise = await this.enterprisesRepository.findByOwnerId(
      owner_id,
    );

    if (!myEnterprise) {
      throw new AppError('Você não é o dono desta empresa.');
    }

    myEnterprise.name = name;
    myEnterprise.area = area;
    myEnterprise.address = address;
    myEnterprise.open_hour = open_hour;
    myEnterprise.close_hour = close_hour;
    myEnterprise.primary_color = primary_color;
    myEnterprise.secondary_color = secondary_color;
    myEnterprise.isPrivate = isPrivate;

    const enterprise = await this.enterprisesRepository.save(myEnterprise);
    return enterprise;
  }
}

export default UpdateEnterpriseService;
