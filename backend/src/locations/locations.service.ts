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

  /**
   * Crear una nueva sucursal
   */
  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const { name, address, latitude, longitude } = createLocationDto;

    // Convertir a formato GeoJSON
    const newLocation = new this.locationModel({
      name,
      address,
      geo: {
        type: 'Point',
        coordinates: [longitude, latitude], // [lng, lat]
      },
    });
    return newLocation.save();
  }

  /**
   * Encontrar todas las sucursales
   */
  async findAll(): Promise<Location[]> {
    return this.locationModel.find().exec();
  }
  
  // --- 1. AQUÍ ESTÁ LA CORRECCIÓN (MÉTODO FALTANTE) ---
  /**
   * Encontrar una sucursal por ID
   */
  async findOne(id: string): Promise<Location> {
    const location = await this.locationModel.findById(id).exec();
    if (!location) {
      throw new NotFoundException(`Sucursal con ID "${id}" no encontrada`);
    }
    return location;
  }
  // --- FIN DE LA CORRECCIÓN ---

  /**
   * Actualizar una sucursal
   */
  async update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location> {
    // Separamos lat/lng del resto de los datos
    const { latitude, longitude, ...restOfDto } = updateLocationDto;

    const updateData: any = { ...restOfDto };

    // Si el admin envió AMBAS coordenadas, actualizamos el objeto 'geo'
    if (latitude !== undefined && longitude !== undefined) {
      updateData.geo = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }
    
    const existingLocation = await this.locationModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // 'new: true' devuelve el documento actualizado
    );
    
    if (!existingLocation) {
      throw new NotFoundException(`Sucursal con ID "${id}" no encontrada`);
    }
    return existingLocation;
  }
  
  /**
   * Eliminar una sucursal
   */
  async remove(id: string): Promise<void> {
    const result = await this.locationModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Sucursal con ID "${id}" no encontrada`);
    }
  }
}