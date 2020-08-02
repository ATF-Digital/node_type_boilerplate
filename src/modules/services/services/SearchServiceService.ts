import AppError from '@shared/errors/AppError';

import { inject, injectable } from 'tsyringe';
import IEnterprisesRepository from '@modules/enterprises/repositories/IEnterprisesRepository';
import { getMinutes, getHours } from 'date-fns';
import Service from '../infra/typeorm/entities/Service';
import IServiceRepository from '../repositories/IServiceRepository';

interface IRequest {
  enterprise_id: string;
  day_week: string;
  category_id: string;
}

@injectable()
class SearchServiceService {
  constructor(
    @inject('EnterprisesRepository')
    private enterprisesRepository: IEnterprisesRepository,

    @inject('ServiceRepository')
    private serviceRepository: IServiceRepository,
  ) {}

  public async execute({
    enterprise_id,
    day_week,
    category_id,
  }: IRequest): Promise<Service[]> {
    const enterprise = await this.enterprisesRepository.findById(enterprise_id);

    if (!enterprise) {
      throw new AppError('This enterprise doesnt exists');
    }

    const serviceDescription = await this.serviceRepository.findByDayWeekAndEnterpriseId(
      {
        enterprise_id,
        category_id,
        day_week,
      },
    );

    serviceDescription.map(service => {
      return Object.assign(service, {
        disabled:
          Number(service.start_hour.replace(':', '')) <
            Number(
              getHours(new Date()).toString() +
                getMinutes(new Date()).toString(),
            ) || service.capacity <= service.appointments.length,
      });
    });

    serviceDescription.sort(function (a, b) {
      if (
        Number(a.start_hour.replace(':', '')) >
        Number(b.start_hour.replace(':', ''))
      ) {
        return 1;
      }
      if (
        Number(a.start_hour.replace(':', '')) <
        Number(b.start_hour.replace(':', ''))
      ) {
        return -1;
      }
      // a must be equal to b
      return 0;
    });

    return serviceDescription;
  }
}

export default SearchServiceService;
