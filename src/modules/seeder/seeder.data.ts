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
  { codeName: 'adm', name: 'admin' },
  { codeName: 'doc', name: 'medico' },
];

export const usersData = [];
export const modulosData = [
  {
    code: 'mod-adm',
    description: 'modulo de administrador',
    order: 1,
  },
  {
    code: 'mod-cue',
    description: 'modulo de cuestionarios',
    order: 2,
  },
  {
    code: 'mod-med',
    description: 'modulo medico',
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
    code: 'rut-caseg',
    description: 'cuestionario de asegurabilidad',
    order: 1,
    modulo: '2',
  },
  {
    code: 'rut-ccovid',
    description: 'cuestionario covid',
    order: 2,
    modulo: '2',
  },

  {
    code: 'rut-historial',
    description: 'historial',
    order: 3,
    modulo: '2',
  },
  {
    code: 'rut-act',
    description: 'actualizacion de datos (sellos)',
    order: 1,
    modulo: '3',
  },
];

export const authorizationsData = [
  {
    code: 'aut-adm-users',
    addOptionFlag: 'ac',
    modifyOptionFlag: 'ac',
    deleteOptionFlag: 'bl',
    codeRoute: '1',
    codeProfile: '1',
  },
  {
    code: 'aut-adm-aseg',
    addOptionFlag: 'bl',
    modifyOptionFlag: 'ac',
    deleteOptionFlag: 'bl',
    codeRoute: '2',
    codeProfile: '1',
  },

  {
    code: 'aut-adm-ccovid',
    addOptionFlag: 'ac',
    modifyOptionFlag: 'ac',
    deleteOptionFlag: 'ac',
    codeRoute: '3',
    codeProfile: '1',
  },

  {
    code: 'aut-adm-historial',
    addOptionFlag: 'ac',
    modifyOptionFlag: 'ac',
    deleteOptionFlag: 'ac',
    codeRoute: '4',
    codeProfile: '1',
  },

  {
    code: 'aut-med-caseg',
    addOptionFlag: 'bl',
    modifyOptionFlag: 'ac',
    deleteOptionFlag: 'bl',
    codeRoute: '2',
    codeProfile: '2',
  },

  {
    code: 'aut-med-ccovid',
    addOptionFlag: 'ac',
    modifyOptionFlag: 'ac',
    deleteOptionFlag: 'ac',
    codeRoute: '3',
    codeProfile: '2',
  },

  {
    code: 'aut-med-historial',
    addOptionFlag: 'ac',
    modifyOptionFlag: 'ac',
    deleteOptionFlag: 'ac',
    codeRoute: '4',
    codeProfile: '2',
  },
  {
    code: 'aut-med-act',
    addOptionFlag: 'ac',
    modifyOptionFlag: 'ac',
    deleteOptionFlag: 'ac',
    codeRoute: '5',
    codeProfile: '2',
  },
];
export const questsData = [
  {
    patientName: 'Johan Raule Miro Moreira',
    pdfName: '21.10.25.CASEG.JMIROMO.pdf',
    jsonQuest: JSON.stringify({
      title: 'Cuestionario de prueba',
      questions: [
        {
          id: 1,
          question: '¿Cuál es el lenguaje principal utilizado en Angular?',
          options: [
            { id: 'a', text: 'JavaScript', isCorrect: false },
            { id: 'b', text: 'TypeScript', isCorrect: true },
            { id: 'c', text: 'Python', isCorrect: false },
          ],
        },
        {
          id: 2,
          question: '¿Cuál es el motor de base de datos de SQL Server?',
          options: [
            { id: 'a', text: 'MySQL', isCorrect: false },
            { id: 'b', text: 'PostgreSQL', isCorrect: false },
            { id: 'c', text: 'MSSQL', isCorrect: true },
          ],
        },
      ],
    }),
    createAt: '02/05/2025',
    createdBy: 'johan rocha',
    updateAt: '02/05/2025',
    updatedBy: 'johan rocha',
  },
];
