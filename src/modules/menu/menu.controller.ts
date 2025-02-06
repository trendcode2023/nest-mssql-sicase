import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { MenuService } from './menu.service';
@ApiTags('Menu')
//@ApiBearerAuth()
@Controller('menu')
export class MenuController {
  constructor(private authService: MenuService) {}

  @Get('menu/:id')
  signIn(@Param('id') idPerfil: string) {
    return this.authService.getMenu(idPerfil);
  }
}
