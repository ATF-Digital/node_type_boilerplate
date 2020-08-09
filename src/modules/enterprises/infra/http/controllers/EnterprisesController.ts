import { Request, Response } from 'express';

import CreateEnterpriseService from '@modules/enterprises/services/CreateEnterpriseService';
import GetEnterpriseByNameService from '@modules/enterprises/services/GetEnterpriseByNameService';
import uploadConfig from '@config/upload';

import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';
import GetMyEnterprise from '@modules/enterprises/services/GetMyEnterprise';
import GetAllEnterprises from '@modules/enterprises/services/GetAllEnterprises';
import GetAllEnterprisesNotAssociated from '@modules/enterprises/services/GetAllEnterprisesNotAssociated';
import UpdateEnterpriseService from '@modules/enterprises/services/UpdateEnterpriseService';

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

    if (enterprise) {
      return response.json(classToClass(enterprise));
    }

    return response.status(404).json();
  }

  public async all(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id;

    const createEnterprise = container.resolve(GetAllEnterprises);

    const enterprise = await createEnterprise.execute({
      user_id,
    });

    return response.json(classToClass(enterprise));
  }

  public async allUnregistered(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const user_id = request.user.id;

    const createEnterprise = container.resolve(GetAllEnterprisesNotAssociated);

    const enterprise = await createEnterprise.execute({
      user_id,
    });

    const newEnterprise = enterprise.map(company => {
      if (!company.logo) {
        return { ...company };
      }
      switch (uploadConfig.driver) {
        case 'disk':
          return {
            ...company,
            logo_url: `${process.env.APP_API_URL}/files/${company.logo}`,
          };
        case 's3':
          return {
            ...company,
            logo_url: `https://${uploadConfig.config.aws.bucket}.s3.amazonaws.com/${company.logo}`,
          };
        default:
          return { ...company };
      }
    });

    return response.json(classToClass(newEnterprise));
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

    return response.json(classToClass(enterprise));
  }

  public async update(request: Request, response: Response): Promise<Response> {
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

    const updateEnterprise = container.resolve(UpdateEnterpriseService);

    const enterprise = await updateEnterprise.execute({
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

    return response.json(classToClass(enterprise));
  }
}
