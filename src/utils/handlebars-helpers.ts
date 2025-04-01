import * as Handlebars from 'handlebars';

export function registerCustomHandlebarsHelpers() {
  Handlebars.registerHelper('eq', function (a, b) {
    return a === b;
  });

  Handlebars.registerHelper('ne', function (a, b) {
    return a !== b;
  });

  Handlebars.registerHelper('gt', function (a, b) {
    return a > b;
  });

  Handlebars.registerHelper('gte', function (a, b) {
    return a >= b;
  });

  Handlebars.registerHelper('lt', function (a, b) {
    return a < b;
  });

  Handlebars.registerHelper('lte', function (a, b) {
    return a <= b;
  });

  Handlebars.registerHelper('or', function (a, b) {
    return a || b;
  });

  Handlebars.registerHelper('and', function (a, b) {
    return a && b;
  });

  Handlebars.registerHelper('not', function (value) {
    return !value;
  });

  // Helper para if con bloque (como if-else)
  Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    switch (operator) {
      case '==':
        return v1 == v2 ? options.fn(this) : options.inverse(this);
      case '===':
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case '!=':
        return v1 != v2 ? options.fn(this) : options.inverse(this);
      case '!==':
        return v1 !== v2 ? options.fn(this) : options.inverse(this);
      case '<':
        return v1 < v2 ? options.fn(this) : options.inverse(this);
      case '<=':
        return v1 <= v2 ? options.fn(this) : options.inverse(this);
      case '>':
        return v1 > v2 ? options.fn(this) : options.inverse(this);
      case '>=':
        return v1 >= v2 ? options.fn(this) : options.inverse(this);
      case '&&':
        return v1 && v2 ? options.fn(this) : options.inverse(this);
      case '||':
        return v1 || v2 ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });

  Handlebars.registerHelper('getLetra', function (index) {
    const letras = 'abcdefghijklmnopqrstuvwxyz';
    return letras[index] ? letras[index] + '.' : '';
  });
  Handlebars.registerHelper('getTextoPregunta', function (id) {
    const preguntas = {
      0: "Enfermedad o defecto de ojos, oídos, nariz o garganta?",
      1: "Mareos, desmayos, convulsiones, cefaleas, torpeza al hablar, parálisis o ataque cerebral; enfermedades de tipo mental o nerviosa?",
      2: "Dificultad al respirar, ronquera o tos persistente, hemoptisis, bronquitis, pleuresía, asma, enfisema, tuberculosis o enfermedad respiratoria crónica?",
      3: "Dolor en el pecho, palpitaciones, hipertensión, fiebre reumática, soplo cardíaco, ataque cardíaco u otra enfermedad del sistema cardiovascular?",
      4: "Ictericia, hemorragia intestinal, úlcera, hernia, apendicitis, colitis, diverticulitis, hemorroides,"
           + " indigestión frecuente o cualquier otra enfermedad del estómago, intestino, hígado o vesícula?",
      5: "Azúcar, albúmina, sangre o pus en la orina, enfermedad venérea, piedra u otras enfermedades de los "
           + "riñones, vejiga, próstata o aparato reproductor?",
      6: "Diabetes, enfermedad de la tiroides u otras glándulas endocrinas?",
      7: "Neuritis, ciática, reumatismo, artritis, gota o cualquier otra enfermedad de los músculos o huesos,"
            + " incluyendo la columna, espalda y articulaciones?",
      8: "Alguna deformidad, cojera o amputación?",
      9: "Enfermedad de la piel, ganglios linfáticos, quistes, tumores, cáncer?",
      10: "Alergias, anemia u otra enfermedad de la sangre?",
      11: "Consumo excesivo del alcohol?",
      12: "¿En la actualidad fuma usted o durante los últimos 12 meses ha fumado cigarrillos, cigarros, pipa o ha usado tabaco en cualquier forma? (En caso afirmativo, detalle cuántos al día)",
      13: "4. ¿Ha usado alguna vez drogas estupefacientes, a menos que fuera bajo consejo médico?",
      14: "5. ¿Está usted actualmente sometido a observación, tratamiento o medicación por alguna enfermedad?",
      15: "6. ¿Tiene usted la intención de buscar consejo médico, tratamiento o hacer cualquier prueba médica?",
      16: " a. ¿Ha tenido alguna enfermedad física o mental aparte de las ya mencionadas?",
      17: " b. ¿Ha tenido alguna revisión, consulta, lesión u operación quirúrgica?",
      18: " d. ¿Ha sido sometido a electrocardiograma, rayos X u otro tipo de análisis?",
      19: " e. ¿Se le ha aconsejado algún análisis, hospitalización u operación que no se hubiera realizado?",
      20: "8. ¿Ha tenido aplazamiento, rechazo o reducción del servicio militar por deficiencia física o mental?",
      21: "9. ¿Ha solicitado o percibido alguna vez indemnización por incapacidad de cualquier tipo?",
      22: "10. ¿Hay en su familia antecedentes de tuberculosis, diabetes, cáncer, hipertensión, enfermedad sanguínea o "
            + "renal, enfermedad mental o suicidio?",
      23: "a. ¿Ha tenido alguna vez trastornos de la menstruación, pechos, aparato genital o alteraciones en el embarazo?",
      24: "b. ¿Está embarazada en la actualidad?" 
      // Puedes continuar con más si necesitas
    };
  
    return preguntas[id] || "";
  });

  Handlebars.registerHelper('isMultipleOf', function (index: number, divisor: number, options: any) {
    if (index % divisor === 0) {
      return options.fn(this); // se renderiza el bloque dentro del helper
    }
    return ''; // no se muestra nada
  });
}