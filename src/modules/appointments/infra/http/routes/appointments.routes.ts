import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import ensureAuthenticated from '@modules/users/infra/http/middlewares/ensureAuthenticated';

import AppointmentsController from '../controllers/AppointmentsController';

const appointmentsRouter = Router();
const appointmentsController = new AppointmentsController();

appointmentsRouter.use(ensureAuthenticated);

appointmentsRouter.get('/me', appointmentsController.index);

appointmentsRouter.delete(
  '/:appointment_id',
  celebrate({
    [Segments.PARAMS]: {
      appointment_id: Joi.string().uuid().required(),
    },
  }),
  appointmentsController.remove,
);

appointmentsRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      service_id: Joi.string()
        .uuid()
        .required()
        .label('Por favor, selecione um horário'),
      enterprise_id: Joi.string().uuid().required(),
      service_date: Joi.date().required(),
    },
  }),
  appointmentsController.create,
);

export default appointmentsRouter;
