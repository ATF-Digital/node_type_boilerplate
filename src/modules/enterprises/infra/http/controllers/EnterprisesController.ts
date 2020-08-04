import { Request, Response } from 'express';

import CreateEnterpriseService from '@modules/enterprises/services/CreateEnterpriseService';
import GetEnterpriseByNameService from '@modules/enterprises/services/GetEnterpriseByNameService';

import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';
import GetMyEnterprise from '@modules/enterprises/services/GetMyEnterprise';
import GetAllEnterprises from '@modules/enterprises/services/GetAllEnterprises';

export default class EnterpriseController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { name } = request.params;

    const createEnterprise = container.resolve(GetEnterpriseByNameService);

    const enterprise = await createEnterprise.execute({
      name,
    });

    return response.json(classToClass(enterprise));
  }

  public async mine(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id;

    const createEnterprise = container.resolve(GetMyEnterprise);

    const enterprise = await createEnterprise.execute({
      user_id,
    });

    return response.json(classToClass(enterprise));
  }

  public async all(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id;

    const createEnterprise = container.resolve(GetAllEnterprises);

    const enterprise = await createEnterprise.execute({
      user_id,
    });

    return response.json(classToClass(enterprise));
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const owner_id = request.user.id;
    const {
      name,
      area,
      address,
      open_hour,
      close_hour,
      primary_color,
      secondary_color,
      isPrivate,
    } = request.body;

    const createEnterprise = container.resolve(CreateEnterpriseService);

    const enterprise = await createEnterprise.execute({
      name,
      area,
      address,
      open_hour,
      close_hour,
      primary_color,
      secondary_color,
      isPrivate,
      owner_id,
    });

    return response.json(enterprise);
  }
}
