import AppError from '@shared/errors/AppError';

import { inject, injectable } from 'tsyringe';
import IEnterprisesRepository from '@modules/enterprises/repositories/IEnterprisesRepository';
import { getMinutes, getHours, isBefore } from 'date-fns';
import Service from '../infra/typeorm/entities/Service';
import IServiceRepository from '../repositories/IServiceRepository';

interface IRequest {
  enterprise_id: string;
  day_week: number;
  category_id: string;
  year: number;
  month: number;
  day: number;
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
    year,
    month,
    day,
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
      const [hour, minute] = service.start_hour.split(':');
      return Object.assign(service, {
        disabled:
          isBefore(new Date(year, month, day, hour, minute), new Date()) ||
          service.capacity <= service.appointments.length,
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
