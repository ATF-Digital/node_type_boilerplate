import {
  startOfHour,
  isBefore,
  getHours,
  format,
  getDate,
  getMonth,
  getYear,
  getMinutes,
  subHours,
  addHours,
  isAfter,
} from 'date-fns';

import AppError from '@shared/errors/AppError';

import { inject, injectable } from 'tsyringe';
import INotificationsRepository from '@modules/notifications/repositories/INotificationRepository';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import IServiceRepository from '@modules/services/repositories/IServiceRepository';
import IPlansUserRepository from '@modules/plans/repositories/IPlansUserRepository';
import IEnterprisesRepository from '@modules/enterprises/repositories/IEnterprisesRepository';
import IPlansRepository from '@modules/plans/repositories/IPlansRepository';
import Appointment from '../infra/typeorm/entities/Appointment';
import IAppointmentsRepository from '../repositories/IAppointmentsRepository';

interface IRequest {
  appointment_id: string;
  user_id: string;
}

@injectable()
class CreateAppointmentService {
  constructor(
    @inject('AppointmentsRepository')
    private appointmentsRepository: IAppointmentsRepository,

    @inject('NotificationsRepository')
    private notificationsRepository: INotificationsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('PlansRepository')
    private plansRepository: IPlansRepository,

    @inject('ServiceRepository')
    private serviceRepository: IServiceRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,

    @inject('PlansUserRepository')
    private plansUserRepository: IPlansUserRepository,

    @inject('EnterprisesRepository')
    private enterprisesRepository: IEnterprisesRepository,
  ) {}

  public async execute({
    appointment_id,
    user_id,
  }: IRequest): Promise<Appointment> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('Usuário não existe.');
    }

    const appointment = await this.appointmentsRepository.findById(
      appointment_id,
    );

    if (!appointment) {
      throw new AppError('Agendamento não encontrado');
    }

    if (isBefore(new Date(appointment.date), new Date())) {
      throw new AppError(
        'Não é possível deletar um agendamento que já passou.',
      );
    }

    await this.appointmentsRepository.remove(appointment);
  }
}

export default CreateAppointmentService;
