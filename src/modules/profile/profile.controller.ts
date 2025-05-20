import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('getall')
  @Roles('admin')
  getAllQuest() {
    return this.profileService.getAllProfiles();
  }
}
