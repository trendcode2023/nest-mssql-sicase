import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { Catalog } from './catalog.entity';
import { ApiBearerAuth } from '@nestjs/swagger';
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

  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Get('/getCatalog')
  async getCatalogByCodeName(@Query('code') codeName: string) {
    return this.catalogService.getCatalogByCodeName(codeName);
  }
}
