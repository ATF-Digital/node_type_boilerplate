import Service from '../infra/typeorm/entities/Service';
import IServiceDTO from '../dtos/IServiceDTO';

interface ISearchData {
  enterprise_id: string;
  day_week: number;
  category_id: string;
  start_hour?: string;
}

export default interface IServiceRepository {
  create(data: IServiceDTO[]): Promise<Service[]>;
  findById(id: string): Promise<Service | undefined>;
  findByDayWeekAndEnterpriseId(searchData: ISearchData): Promise<Service[]>;
  findByDayWeekAndEnterpriseIdAndNameAndCategory(
    searchData: ISearchData,
  ): Promise<Service | undefined>;
  save(service: Service[]): Promise<Service[]>;
}
