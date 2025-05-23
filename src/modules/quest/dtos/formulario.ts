export interface Declaracion {
    nrosolicitud: string;
    asesor: string;
    estadocivil: string;
    names: string;
    numerodocumento: string;
    fechanacimiento: string; // puede usarse Date si lo conviertes en el código
  }
  
  export interface Entender {
    nameanddirection: string;
    fechaandmotivation: string;
    medication: string;
  }
  
  export interface Enfermedad {
    answer: string;
    sustento: string;
    id: string;
  }
  
  export interface Familiar {
    tipo: string;
    edadSiVive: number;
    estadoSalud: string;
    edadAlMorir: number;
  }
  
  export interface Firma {
    medico: string;
    propuestoAsegurado:string
  }
  export interface DateAndHour {
   hora: string;
   fecha:string
  }
  export interface Formulario {
    logo: string;
    imageSoplo:string;
    declaracion: Declaracion;
    entender: Entender;
    entenderEnfermedades: Enfermedad[];
    familiares: Familiar[];
    firma: Firma;
    dateCuestionarioString:string;
    dateAndHourCuestionarioString:DateAndHour

  }