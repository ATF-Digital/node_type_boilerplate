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
  service_id: string;
  user_id: string;
  enterprise_id: string;
  service_date: Date;
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
    service_id,
    user_id,
    enterprise_id,
    service_date,
  }: IRequest): Promise<Appointment> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('Dados do usuário não existe.');
    }

    const service = await this.serviceRepository.findById(service_id);

    if (!service) {
      throw new AppError('Dados do serviço não existe.');
    }

    const enterprise = await this.enterprisesRepository.findById(enterprise_id);

    if (!enterprise) {
      throw new AppError('Dados da empresa não existe');
    }

    if (enterprise_id !== service.enterprise_id) {
      throw new AppError('Este serviço não pertence à esta empresa.');
    }

    const formattedDateWithSubHoursToSchedule = addHours(
      new Date(),
      service.hour_to_schedule,
    );

    const [hour, minute] = service.start_hour.split(':');
    const formattedServiceDate = new Date(
      getYear(new Date(service_date)),
      getMonth(new Date(service_date)),
      getDate(new Date(service_date)),
      Number(hour) || 0,
      Number(minute) || 0,
    );

    if (!Number(hour) && !Number(minute)) {
      throw new AppError(
        "Horas e minutos com formato errado, coloque o titulo do serviço como o exemplo: '09:00'",
      );
    }

    if (enterprise?.owner_id === user_id) {
      const ownerAppointment = await this.appointmentsRepository.create({
        service_id,
        user_id,
        date: formattedServiceDate,
        enterprise_id,
      });

      return ownerAppointment;
    }

    if (isBefore(new Date(formattedServiceDate), new Date())) {
      throw new AppError(
        'Não é possível se agendar em uma data que já passou.',
      );
    }

    if (isBefore(formattedServiceDate, formattedDateWithSubHoursToSchedule)) {
      throw new AppError(
        `Você não pode se agendar faltando ${service.hour_to_schedule}h para o horário`,
      );
    }

    const currentPlan = await this.plansUserRepository.findByActive(
      user_id,
      enterprise_id,
    );

    if (!currentPlan && enterprise.isPrivate) {
      throw new AppError('Usuário sem plano com a empresa.');
    }

    if (currentPlan) {
      if (isBefore(currentPlan.expiration_at, new Date())) {
        throw new AppError('Plano do usuário expirado.');
      }

      if (!currentPlan.active) {
        throw new AppError('Seu plano com esta empresa não esta ativo.');
      }

      const planAppointmentsCapacity = await this.plansRepository.findById(
        currentPlan.plan_id,
      );
      const allUsersAppointmentsFromThisEnterprise = await this.appointmentsRepository.searchAllAppointmentsFromUserBetweenDate(
        {
          createAt: currentPlan.created_at,
          expirationAt: currentPlan.expiration_at,
          user_id,
          enterprise_id: service.enterprise_id,
        },
      );

      if (
        Number(allUsersAppointmentsFromThisEnterprise.length) >=
        Number(planAppointmentsCapacity?.schedule_limit)
      ) {
        throw new AppError(
          `Você pode se agendar ${Number(
            planAppointmentsCapacity?.schedule_limit,
          )} vezes com o seu plano atual, mas já agendou ${Number(
            allUsersAppointmentsFromThisEnterprise.length,
          )} vezes`,
        );
      }
    }

    const isUserInThisServiceAppointment = await this.appointmentsRepository.findByServiceAndUserId(
      user_id,
      service_id,
    );

    if (isUserInThisServiceAppointment) {
      throw new AppError('Usuário já agendado neste horário.');
    }

    const userAppointments = await this.appointmentsRepository.findAllFromUserInThisEnterprise(
      user_id,
      enterprise_id,
    );

    const futureAppointments = userAppointments.filter(appointment =>
      isAfter(appointment.date, new Date()),
    );

    if (futureAppointments.length > 0 && !service.pending_scheduling) {
      throw new AppError(
        'Você já tem um agendamento pendente com esta empresa.',
      );
    }

    const usersInService = await this.appointmentsRepository.usersInService(
      service_id,
    );

    if (Number(usersInService) >= Number(service.capacity)) {
      throw new AppError('Este horário esta cheio.');
    }

    // const appointmentDate = startOfHour(date);

    // if (getHours(appointmentDate) < 8 || getHours(appointmentDate) > 17) {
    //   throw new AppError('You canonly create appointments between 8am and 5pm');
    // }

    // const findAppointmentInSameDate = await this.appointmentsRepository.findByDate(
    //   appointmentDate,
    //   provider_id,
    // );

    // if (findAppointmentInSameDate) {
    //   throw new AppError('This appointment is already booked');
    // }

    const appointment = await this.appointmentsRepository.create({
      service_id,
      user_id,
      date: formattedServiceDate,
      enterprise_id,
    });

    return appointment;

    // const dateFormatted = format(appointmentDate, "dd/MM/yyyy 'às' HH:mm'h'");

    // await this.notificationsRepository.create({
    //   recipient_id: provider_id,
    //   content: `Novo agendamento para dia ${dateFormatted}`,
    // });

    // await this.cacheProvider.invalidate(
    //   `provider-appointments:${provider_id}:${format(
    //     appointmentDate,
    //     'yyyy-M-d',
    //   )}`,
    // );
  }
}

export default CreateAppointmentService;
