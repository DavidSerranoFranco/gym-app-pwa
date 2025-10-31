// backend/src/schedules/schedules.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { Schedule, ScheduleDocument } from './schemas/schedule.schema';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel(Schedule.name) private scheduleModel: Model<ScheduleDocument>,
  ) {}

  create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    const createdSchedule = new this.scheduleModel(createScheduleDto);
    return createdSchedule.save();
  }

  // --- MÉTODO ACTUALIZADO ---
  // Usamos .populate() para que en lugar de devolver solo el ID de la sucursal,
  // devuelva el objeto completo de la sucursal (nombre, dirección, etc.).
  findAll(): Promise<Schedule[]> {
    return this.scheduleModel
      .find()
      .populate('location') // <-- La magia ocurre aquí
      .sort({ dayOfWeek: 1, startTime: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Schedule> {
    const schedule = await this.scheduleModel.findById(id).populate('location').exec();
    if (!schedule) {
      throw new NotFoundException(`Horario con ID "${id}" no encontrado`);
    }
    return schedule;
  }

  async update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
    const updatedSchedule = await this.scheduleModel
      .findByIdAndUpdate(id, updateScheduleDto, { new: true })
      .exec();
    if (!updatedSchedule) {
      throw new NotFoundException(`Horario con ID "${id}" no encontrado`);
    }
    return updatedSchedule;
  }

  async remove(id: string) {
    const result = await this.scheduleModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Horario con ID "${id}" no encontrado`);
    }
    return { message: 'Horario eliminado exitosamente' };
  }
}