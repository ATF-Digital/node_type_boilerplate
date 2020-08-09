import { Repository, getRepository } from 'typeorm';

import IServiceRepository from '@modules/services/repositories/IServiceRepository';
import IServiceDTO from '@modules/services/dtos/IServiceDTO';
import Service from '../entities/Service';

interface ISearchData {
  enterprise_id: string;
  day_week: number;
  category_id: string;
  start_hour?: string;
}

class ServiceRepository implements IServiceRepository {
  private ormRepository: Repository<Service>;

  constructor() {
    this.ormRepository = getRepository(Service);
  }

  public async findById(id: string): Promise<Service | undefined> {
    const enterprise = await this.ormRepository.findOne({
      relations: ['enterprise'],
      where: { id },
    });

    return enterprise;
  }

  public async delete(service: Service): Promise<Service | undefined> {
    const serviceDeleted = await this.ormRepository.remove(service);

    return serviceDeleted;
  }

  public async findByDayWeekAndEnterpriseId(
    searchData: ISearchData,
  ): Promise<Service[]> {
    const services = await this.ormRepository.find({
      relations: ['description', 'appointments', 'appointments.user'],
      where: {
        enterprise_id: searchData.enterprise_id,
        day_week: searchData.day_week,
        category_id: searchData.category_id,
      },
    });

    return services;
  }

  public async findByDayWeekAndEnterpriseIdAndNameAndCategory(
    searchData: ISearchData,
  ): Promise<Service | undefined> {
    const services = await this.ormRepository.findOne({
      where: {
        enterprise_id: searchData.enterprise_id,
        day_week: searchData.day_week,
        category_id: searchData.category_id,
        start_hour: searchData.start_hour,
      },
    });

    return services;
  }

  public async create(
    serviceDescriptionData: IServiceDTO[],
  ): Promise<Service[]> {
    const checkExistService: Service[] = [];

    const serviceDescription = serviceDescriptionData.map(async data => {
      const service = await this.findByDayWeekAndEnterpriseIdAndNameAndCategory(
        {
          enterprise_id: data.enterprise_id,
          day_week: data.day_week,
          category_id: data.category_id,
          start_hour: data.start_hour,
        },
      );
      if (!service) {
        return checkExistService.push(data);
      }
    });

    await Promise.all(serviceDescription);

    const myService = this.ormRepository.create(checkExistService);

    await this.ormRepository.save(myService);

    return myService;
  }

  public async save(serviceDescriptionData: Service[]): Promise<Service[]> {
    return this.ormRepository.save(serviceDescriptionData);
  }
}

export default ServiceRepository;
