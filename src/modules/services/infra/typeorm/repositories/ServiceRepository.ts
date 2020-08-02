import { Repository, getRepository } from 'typeorm';

import IServiceRepository from '@modules/services/repositories/IServiceRepository';
import IServiceDTO from '@modules/services/dtos/IServiceDTO';
import Service from '../entities/Service';

interface ISearchData {
  enterprise_id: string;
  day_week: string;
  category_id: string;
}

class ServiceRepository implements IServiceRepository {
  private ormRepository: Repository<Service>;

  constructor() {
    this.ormRepository = getRepository(Service);
  }

  public async findById(id: string): Promise<Service | undefined> {
    const enterprise = await this.ormRepository.findOne({ where: { id } });

    return enterprise;
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

  // const serviceDescription = this.ormRepository.create(
  //   serviceDescriptionData.map(data => {
  //     const service = this.ormRepository.findByDayWeekAndEnterpriseIdAndNameAndCategory(
  //       {
  //         enterprise_id: data.enterprise_id,
  //         day_week: data.day_week,
  //         category_id: data.category_id,
  //         start_hour: data.start_hour,
  //       },
  //     );
  //     if (!service) {
  //       return { ...data };
  //     }
  //   }),
  // );

  public async create(
    serviceDescriptionData: IServiceDTO[],
  ): Promise<Service[]> {
    const serviceDescription = this.ormRepository.create(
      serviceDescriptionData.map(data => ({ ...data })),
    );

    await this.ormRepository.save(serviceDescription);

    return serviceDescription;
  }

  public async save(serviceDescriptionData: Service[]): Promise<Service[]> {
    return this.ormRepository.save(serviceDescriptionData);
  }
}

export default ServiceRepository;
