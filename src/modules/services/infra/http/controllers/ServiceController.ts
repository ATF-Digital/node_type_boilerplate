import { Request, Response } from 'express';

import CreateServicesService from '@modules/services/services/CreateServicesService';
import SearchServiceService from '@modules/services/services/SearchServiceService';
import DeleteServiceService from '@modules/services/services/DeleteServiceService';

import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

export default class ServiceController {
  public async index(request: Request, response: Response): Promise<Response> {
    const {
      enterprise_id,
      day_week,
      category_id,
      year,
      month,
      day,
    } = request.params;

    const searchServiceService = container.resolve(SearchServiceService);

    const serviceCategory = await searchServiceService.execute({
      enterprise_id,
      day_week,
      category_id,
      year,
      month,
      day,
    });

    return response.json(classToClass(serviceCategory));
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { service_id } = request.params;
    const user_id = request.user.id;

    const searchServiceService = container.resolve(DeleteServiceService);

    const serviceCategory = await searchServiceService.execute({
      service_id,
      user_id,
    });

    return response.json(classToClass(serviceCategory));
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id;
    const { dataArray } = request.body;

    const createServicesService = container.resolve(CreateServicesService);

    const serviceCategory = await createServicesService.execute({
      dataArray,
      user_id,
    });

    return response.json(serviceCategory);
  }
}
