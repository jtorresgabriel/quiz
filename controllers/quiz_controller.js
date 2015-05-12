var models = require('../models/models.js');

// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz.find(quizId).then(
  	function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else{ next(new Error('No existe quizId=' + quizId)); }
    }
  ).catch(function(error) { next(error)});
};

//GET /quizes
exports.index = function(req, res){
  models.Quiz.findAll().then(function(quizes){
		res.render('quizes/index', {quizes: quizes});
  }
  ).catch(function(error) { next(error);})
};

//GET /quizid/:id
exports.show = function(req, res){
		res.render('quizes/show', {quiz: req.quiz});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render(
    'quizes/answer', 
    { quiz: req.quiz, respuesta: resultado }
  );
};

//GET /busqueda
exports.search = function(req, res){
  models.Quiz.findAll().then(function(quizes){
    var busqueda = [];
    var j;
    var i = 0;
    var porcentaje;
    var introducido = req.query.search.replace(" ", "%")
    for (j=0; j < quizes.length; j++) {
      porcentaje = '%' + quizes[j].pregunta + '%';
      porcentaje = porcentaje.replace(" ", "%");
      if(porcentaje.indexOf(introducido) > 0){
      	busqueda[i] = j;
      	i++;
      }
    }
  res.render('quizes/search', {quizes: quizes, busqueda: busqueda });
  }).catch(function(error) { next(error);})
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( //crea objeto quiz
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );
  res.render('quizes/new', {quiz: quiz});
};

// GET /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build( req.body.quiz );
  //guarda en DB los campos pregunta y respuesta de quiz
  quiz.save({fields: ["Pregunta", "Respuesta"]}).then(function(){
    res.redirect('/quizes'); //redireccion HTTP (UTL relative) lista de preguntas 
  })
};