import { inject, injectable } from 'tsyringe';
import Enterprises from '../infra/typeorm/entities/Enterprises';
import IEnterprisesRepository from '../repositories/IEnterprisesRepository';

interface IRequest {
  user_id: string;
}

@injectable()
class GetMyEnterprise {
  constructor(
    @inject('EnterprisesRepository')
    private enterprisesRepository: IEnterprisesRepository,
  ) {}

  public async execute({
    user_id,
  }: IRequest): Promise<Enterprises | undefined> {
    const enterprise = await this.enterprisesRepository.findAll(user_id);

    return enterprise;
  }
}

export default GetMyEnterprise;
