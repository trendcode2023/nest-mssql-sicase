export const catalogsData = [
  { codeName: 'td', name: 'document type', detail: 'dni' },
  { codeName: 'td', name: 'document type', detail: 'pasaporte' },
  { codeName: 'tc', name: 'questionary type', detail: 'cuestionario de salud' },
  {
    codeName: 'tc',
    name: 'questionary type',
    detail: 'cuestionario medico COVID-19',
  },
];

export const profilesData = [
  { codeName: 'sad', name: 'superadmin' },
  { codeName: 'adm', name: 'admin' },
  { codeName: 'doc', name: 'doctor' },
];

export const usersData = [
  {
    documentType: '01',
    documentNum: '12345678',
    cmp: '12345',
    names: 'sicase',
    patSurname: 'super',
    matSurname: 'admin',
    username: 'SADMINS',
    email: 'admin@gmail.com',
    password: 'Qwerty*2025',
    cellphone: '123456789',
    RouteStamp: 'https://images.com',
    createdBy: '12345678',
    updatedBy: '12345678',
    codprofile: '02',
  },
];
export const modulosData = [
  {
    code: 'modadm',
    description: 'modulo de administrador',
    order: 1,
  },
  {
    code: 'modmed',
    description: 'modulo de medico',
    order: 2,
  },
  {
    code: 'modcue',
    description: 'modulo de cuestionarios',
    order: 3,
  },
];

export const routesData = [
  {
    code: 'rut-usuarios',
    description: 'administrar usuarios',
    order: 1,
    modulo: '1',
  },
  {
    code: 'rut-sellos',
    description: 'administrar sellos',
    order: 2,
    modulo: '1',
  },
  {
    code: 'rut-cuest',
    description: 'administrar cuestionarios',
    order: 2,
    modulo: '1',
  },
];

export const authorizationsData = [
  {
    code: 'aut-adm-users',
    addOptionFlag: 'ac',
    modifyOptionFlag: 'ac',
    deleteOptionFlag: 'ac',
    codeRoute: '1',
    codeProfile: '2',
  },
  {
    code: 'aut-adm-sellos',
    addOptionFlag: 'ac',
    modifyOptionFlag: 'ac',
    deleteOptionFlag: 'ac',
    codeRoute: '2',
    codeProfile: '2',
  },

  {
    code: 'aut-adm-cuestionarios',
    addOptionFlag: 'ac',
    modifyOptionFlag: 'ac',
    deleteOptionFlag: 'ac',
    codeRoute: '3',
    codeProfile: '2',
  },

  {
    code: 'aut-med-sellos',
    addOptionFlag: 'ac',
    modifyOptionFlag: 'ac',
    deleteOptionFlag: 'ac',
    codeRoute: '2',
    codeProfile: '3',
  },
];
