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
		res.render('quizes/index', {quizes: quizes, errors: []});
  }
  ).catch(function(error) { next(error);})
};

//GET /quizid/:id
exports.show = function(req, res){
		res.render('quizes/show', {quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
  var resultado = 'Incorrecto';
  if ( req.query.respuesta.toLowerCase() === req.quiz.respuesta.toLowerCase() ) {
    resultado = 'Correcto';
  } //toLowerCase para que transforme ambos a minúsculas
  res.render(
    'quizes/answer', 
    { quiz: req.quiz, respuesta: resultado, errors: []}
  );
};

//GET /busqueda
exports.search = function(req, res){
  models.Quiz.findAll().then(function(quizes){
    var busqueda = [];
    var j;
    var i = 0;
    var porcentaje;
    var introducido = req.query.search.replace(" ", "%");
    introducido = introducido.toLowerCase();

    for (j=0; j < quizes.length; j++) {
      porcentaje = '%' + quizes[j].pregunta + '%';
      porcentaje = porcentaje.replace(" ", "%");
      porcentaje = porcentaje.toLowerCase();
      if(porcentaje.indexOf(introducido) > 0){
      	busqueda[i] = j;
      	i++;
      }
    }
  res.render('quizes/search', {quizes: quizes, busqueda: busqueda, errors: []});
  }).catch(function(error) { next(error);})
};

// GET /quizes/new
exports.new = function(req, res) {
  var quiz = models.Quiz.build( //crea objeto quiz
    {pregunta: "Pregunta", respuesta: "Respuesta"}
  );
  res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res) {
  var quiz = models.Quiz.build(req.body.quiz);

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta"]})
        .then( function(){ res.redirect('/quizes'); } ) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};