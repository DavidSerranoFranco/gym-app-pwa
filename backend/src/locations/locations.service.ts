import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location, LocationDocument } from './schemas/location.schema';

@Injectable()
export class LocationsService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>,
  ) {}

  create(createLocationDto: CreateLocationDto) {
    const createdLocation = new this.locationModel(createLocationDto);
    return createdLocation.save();
  }

  findAll() {
    return this.locationModel.find().exec();
  }

  async findOne(id: string) {
    const location = await this.locationModel.findById(id).exec();
    if (!location) {
      throw new NotFoundException(`Sucursal con ID "${id}" no encontrada`);
    }
    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    const updatedLocation = await this.locationModel
      .findByIdAndUpdate(id, updateLocationDto, { new: true })
      .exec();
    if (!updatedLocation) {
      throw new NotFoundException(`Sucursal con ID "${id}" no encontrada`);
    }
    return updatedLocation;
  }

  async remove(id: string) {
    const result = await this.locationModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Sucursal con ID "${id}" no encontrada`);
    }
    return { message: 'Sucursal eliminada exitosamente' };
  }
}