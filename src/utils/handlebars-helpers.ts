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
      // Puedes continuar con más si necesitas
    };
  
    return preguntas[id] || "";
  });
}