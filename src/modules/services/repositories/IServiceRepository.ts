import Service from '../infra/typeorm/entities/Service';
import IServiceDTO from '../dtos/IServiceDTO';

interface ISearchData {
  enterprise_id: string;
  day_week: string;
  category_id: string;
}

export default interface IServiceRepository {
  create(data: IServiceDTO[]): Promise<Service[]>;
  findById(id: string): Promise<Service | undefined>;
  findByDayWeekAndEnterpriseId(searchData: ISearchData): Promise<Service[]>;
  save(service: Service[]): Promise<Service[]>;
}
