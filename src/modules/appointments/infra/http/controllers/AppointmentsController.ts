import { Request, Response } from 'express';

import ListUserAppointmentsService from '@modules/appointments/services/ListUserAppointmentsService';

import { container } from 'tsyringe';
import CreateAppointmentService from '@modules/appointments/services/CreateAppointmentService';
import { classToClass } from 'class-transformer';

export default class AppointmentsController {
  public async index(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id;

    const listUserAppointmentsService = container.resolve(
      ListUserAppointmentsService,
    );

    const userAppointments = await listUserAppointmentsService.execute(user_id);

    return response.json(classToClass(userAppointments));
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const user_id = request.user.id;
    const { service_id, enterprise_id, service_date } = request.body;

    const createAppointment = container.resolve(CreateAppointmentService);

    const appointment = await createAppointment.execute({
      service_id,
      user_id,
      enterprise_id,
      service_date,
    });

    return response.json(appointment);
  }
}
