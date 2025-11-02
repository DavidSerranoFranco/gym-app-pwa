import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserMembershipsService } from './user-memberships.service';
import { CreateUserMembershipDto } from './dto/create-user-membership.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/schemas/user.schema'; // Importar UserRole

@Controller('user-memberships')
export class UserMembershipsController {
  constructor(private readonly userMembershipsService: UserMembershipsService) {}

  /**
   * RUTA ADMIN: Asignar membresía
   */
  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN) // Solo el Admin puede
  create(@Body() createUserMembershipDto: CreateUserMembershipDto) {
    return this.userMembershipsService.create(createUserMembershipDto);
  }

  /**
   * RUTA ADMIN: Ver TODAS las membresías
   */
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN) // Solo el Admin puede
  findAll() {
    return this.userMembershipsService.findAll();
  }

  /**
   * RUTA CLIENTE: Ver MIS membresías
   */
  @Get('my-memberships')
  @UseGuards(AuthGuard('jwt')) // Cualquier usuario logueado
  findMyMemberships(@Req() req) {
    const userId = req.user.id;
    // Esto ya no dará error porque 'findMyMemberships' ya existe
    return this.userMembershipsService.findMyMemberships(userId);
  }

  /**
   * RUTA ADMIN: Revocar membresía
   */
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN) // Solo el Admin puede
  delete(@Param('id') id: string) {
    // --- CORRECCIÓN DE ERROR 2 ---
    // Se llama a 'delete' en lugar de 'remove'
    return this.userMembershipsService.delete(id);
  }
}