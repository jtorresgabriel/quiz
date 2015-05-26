//Definicion del model de Quiz

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
  	'Quiz',
    { pregunta: {
        type: DataTypes.STRING,
        validate: { notEmpty: {msg: "*Campo de 'pregunta' vacío"}}
      },
      respuesta: {
        type: DataTypes.STRING,
        validate: { notEmpty: {msg: "*Campo de 'respuesta' vacío"}}
      },
      image: {
        type: DataTypes.STRING
      }
    }
  );
}