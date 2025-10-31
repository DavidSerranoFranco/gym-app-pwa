import { Controller, Get, Post, Body, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserMembershipsService } from './user-memberships.service';
import { CreateUserMembershipDto } from './dto/create-user-membership.dto';

@Controller('user-memberships')
export class UserMembershipsController {
  constructor(private readonly userMembershipsService: UserMembershipsService) {}

  @Post()
  create(@Body() createUserMembershipDto: CreateUserMembershipDto) {
    return this.userMembershipsService.create(createUserMembershipDto);
  }

  @Get()
  findAll() {
    return this.userMembershipsService.findAll();
  }

  // --- NUEVO ENDPOINT ---
  @Get('my-memberships')
  @UseGuards(AuthGuard('jwt')) // Ruta protegida
  findMyMemberships(@Req() req) {
    const userId = req.user.id;
    return this.userMembershipsService.findMyMemberships(userId);
  }
  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userMembershipsService.remove(id);
  }
}