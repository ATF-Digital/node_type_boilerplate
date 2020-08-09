import { Router } from 'express';

import { celebrate, Segments, Joi } from 'celebrate';
import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';

import EnterpriseInviteController from '../controllers/EnterpriseInviteController';

const enterprisesInviteRouter = Router();

const enterpriseInviteController = new EnterpriseInviteController();

enterprisesInviteRouter.use(ensureAuthenticated);

enterprisesInviteRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      enterprise_id: Joi.string().uuid().required(),
      user_id: Joi.string().uuid().required(),
    },
  }),
  enterpriseInviteController.create,
);

enterprisesInviteRouter.get(
  '/user/:user_id/enterprise/:enterprise_id/search',
  celebrate({
    [Segments.PARAMS]: {
      user_id: Joi.string().uuid(),
      enterprise_id: Joi.string().uuid(),
    },
  }),
  enterpriseInviteController.index,
);

enterprisesInviteRouter.get('/', enterpriseInviteController.allInvites);

enterprisesInviteRouter.get(
  '/enterprise-invites',
  enterpriseInviteController.allEnterpriseInvites,
);

enterprisesInviteRouter.get(
  '/accepted',
  enterpriseInviteController.allAcceptedInvites,
);

enterprisesInviteRouter.get(
  '/enterprise/accepted',
  enterpriseInviteController.allEnterpriseAcceptedInvites,
);

enterprisesInviteRouter.get(
  '/active-plan/:enterprise_id',
  enterpriseInviteController.show,
);

enterprisesInviteRouter.put(
  '/accept',
  celebrate({
    [Segments.BODY]: {
      invite_id: Joi.string().uuid().required(),
    },
  }),
  enterpriseInviteController.update,
);

enterprisesInviteRouter.delete(
  '/:invite_id',
  celebrate({
    [Segments.PARAMS]: {
      invite_id: Joi.string().uuid().required(),
    },
  }),
  enterpriseInviteController.delete,
);

export default enterprisesInviteRouter;
