import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MenuService } from './menu.service';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
@ApiTags('Menu')
//@ApiBearerAuth()
@Controller('menu')
export class MenuController {
  constructor(private authService: MenuService) {}

  @Get('menu/:id')
  @UseGuards(AuthGuard,RolesGuard)
  @Roles('MEDICO','ADMIN')
  signIn(@Param('id') idPerfil: string) {
    return this.authService.getMenu(idPerfil);
  }
}
