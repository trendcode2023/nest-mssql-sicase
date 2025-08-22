import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MenuService } from './menu.service';
import { AuthGuard } from 'src/guards/auth.guard';
@ApiTags('Menu')
//@ApiBearerAuth()
@Controller('menu')
export class MenuController {
  constructor(private authService: MenuService) {}
  @UseGuards(AuthGuard)
  @Get('menu/:id')
  signIn(@Param('id') idPerfil: string) {
    return this.authService.getMenu(idPerfil);
  }
}
