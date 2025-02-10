import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Authorization } from '../authorizations/authorizations.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Authorization)
    private readonly authorizationRepository: Repository<Authorization>,
  ) {}

  async getMenu(idPerfil: string) {
    // 1. Obtener las autorizaciones del perfil con sus respectivas rutas y módulos
    const authorizations = await this.authorizationRepository.find({
      where: { profile: { id: idPerfil } },
      relations: ['route', 'route.modulo'],
    });
    console.log('authorizations:');
    console.log(authorizations);
    if (!authorizations.length) {
      throw new Error('No se encontraron módulos para este perfil.');
    }

    // 2. Agrupar rutas por módulo
    const menuMap = new Map();

    for (const auth of authorizations) {
      const { route } = auth;
      const { modulo } = route;

      if (!menuMap.has(modulo.id)) {
        menuMap.set(modulo.id, {
          id: modulo.id,
          code: modulo.code,
          description: modulo.description,
          order: modulo.order,
          routes: [],
        });
      }

      menuMap.get(modulo.id).routes.push({
        id: route.id,
        code: route.code,
        description: route.description,
        order: route.order,
        authorization: {
          id: auth.id,
          code: auth.code,
          addOptionFlag: auth.addOptionFlag,
          modifyOptionFlag: auth.modifyOptionFlag,
          deleteOptionFlag: auth.deleteOptionFlag,
        },
      });
    }

    // 3. Convertir el mapa a un array ordenado por `order`
    const menu = Array.from(menuMap.values()).sort((a, b) => a.order - b.order);
    // agregar el atributo imagen del modulo y de la ruta
    return menu;
  }
}
