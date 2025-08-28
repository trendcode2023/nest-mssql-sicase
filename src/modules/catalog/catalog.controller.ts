import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { Catalog } from './catalog.entity';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('catalogs')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async getAllCatalogs(): Promise<Catalog[]> {
    return this.catalogService.getAllCatalogs();
  }

  // @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('/getCatalog')
  @ApiOperation({ summary: 'Obtener un catálogo por codeName' })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Código del catálogo (Ejemplos: td, tc)',
  })
  async getCatalogByCodeName(@Query('code') codeName: string) {
    return this.catalogService.getCatalogByCodeName(codeName);
  }
}
