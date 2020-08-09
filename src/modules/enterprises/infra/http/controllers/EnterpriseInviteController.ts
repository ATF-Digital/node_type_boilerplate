import { Request, Response } from 'express';

import CreateEnterpriseInviteService from '@modules/enterprises/services/CreateEnterpriseInviteService';
import GetAllEnterpriseInviteService from '@modules/enterprises/services/GetAllEnterpriseInviteService';

import { container } from 'tsyringe';
import { classToClass, plainToClass } from 'class-transformer';
import Enterprises from '../../typeorm/entities/Enterprises';

export default class EnterpriseInviteController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { enterprise_id, user_id } = request.params;

    const createEnterpriseInvite = container.resolve(
      CreateEnterpriseInviteService,
    );

    const enterpriseInvite = await createEnterpriseInvite.search({
      enterprise_id,
      user_id,
    });

    return response.json(enterpriseInvite);
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { enterprise_id } = request.params;
    const user_id = request.user.id;

    const createEnterpriseInvite = container.resolve(
      CreateEnterpriseInviteService,
    );

    const enterpriseInvite = await createEnterpriseInvite.canEnter({
      enterprise_id,
      user_id,
    });

    return response.json(enterpriseInvite);
  }

  public async allInvites(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const user_id = request.user.id;

    const createEnterpriseInvite = container.resolve(
      CreateEnterpriseInviteService,
    );

    const enterpriseInvite = await createEnterpriseInvite.searchAllUserInvites(
      user_id,
    );

    return response.json(classToClass(enterpriseInvite));
  }

  public async allEnterpriseInvites(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const user_id = request.user.id;

    const getAllEnterpriseInvite = container.resolve(
      GetAllEnterpriseInviteService,
    );

    const enterpriseInvite = await getAllEnterpriseInvite.searchAllEnterpriseInvites(
      user_id,
    );

    return response.json(classToClass(enterpriseInvite));
  }

  public async allAcceptedInvites(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const user_id = request.user.id;

    const createEnterpriseInvite = container.resolve(
      CreateEnterpriseInviteService,
    );

    const enterpriseInvite = await createEnterpriseInvite.searchAllUserAcceptedInvites(
      user_id,
    );

    return response.json(classToClass(enterpriseInvite));
  }

  public async allEnterpriseAcceptedInvites(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const user_id = request.user.id;

    const createEnterpriseInvite = container.resolve(
      GetAllEnterpriseInviteService,
    );

    const enterpriseInvite = await createEnterpriseInvite.searchAllAcceptedEnterpriseInvites(
      user_id,
    );

    return response.json(classToClass(enterpriseInvite));
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { invite_id } = request.body;
    const user_id = request.user.id;

    const createEnterpriseInvite = container.resolve(
      CreateEnterpriseInviteService,
    );

    const enterpriseInvite = await createEnterpriseInvite.accept({
      invite_id,
      user_id,
    });

    return response.json(enterpriseInvite);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { invite_id } = request.params;
    const user_id = request.user.id;

    const createEnterpriseInvite = container.resolve(
      CreateEnterpriseInviteService,
    );

    const enterpriseInvite = await createEnterpriseInvite.remove({
      invite_id,
      user_id,
    });

    return response.json(enterpriseInvite);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { enterprise_id, user_id } = request.body;

    const createEnterpriseInvite = container.resolve(
      CreateEnterpriseInviteService,
    );

    const enterpriseInvite = await createEnterpriseInvite.execute({
      enterprise_id,
      user_id,
    });

    return response.json(enterpriseInvite);
  }
}
