var models = require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto
// pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
  var objQuizOwner = req.quiz.UserId;
  var logUser = req.session.user.id;
  var isAdmin = req.session.user.isAdmin;

  if (isAdmin || objQuizOwner === logUser){
    next();
  } else{
    res.redirect('/');
  }
};

// Autoload :id
exports.load = function(req, res, next, quizId) {
  models.Quiz.find({
  		where:{ id: Number(quizId) },
  		include: [{ model: models.Comment }]
  }).then(function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else{ next(new Error('No existe quizId=' + quizId)); }
    }
  ).catch(function(error) { next(error)});
};

//GET /quizes
exports.index = function(req, res){
  var options = {};
  if(req.user){
    options.where = {UserId: req.user.id}
  }

  models.Quiz.findAll(options).then(function(quizes){
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

//GET /quizes/search
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

//GET /quizes/search
exports.stadistics = function(req, res){
 models.Quiz.findAll({include: [{
     model: models.Comment 
    }]}).then(function(pregunta){
     models.Comment.count().then(function(countComentarios){
      var numeroPreguntas = pregunta.length;
      var medio = countComentarios / numeroPreguntas;
      var pregConComment = 0;
      for(index = 0; index < numeroPreguntas; index++){

        //console.log(P[index].Comments);
        if(pregunta[index].Comments.length > 0){
          pregConComment++;
        }
      }
      var pregSinComment = numeroPreguntas - pregConComment;


      res.render('quizes/stadistics',{errors: [], numeroPreguntas: numeroPreguntas, 
        countComentarios: countComentarios, medio: medio.toFixed(2), 
        pregConComment: pregConComment, pregSinComment: pregSinComment});

    });
  });
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
  req.body.quiz.UserId = req.session.user.id;
  if(req.files.image){
    req.body.quiz.image = req.files.image.name;
  }
  var quiz = models.Quiz.build(req.body.quiz);

  quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/new', {quiz: quiz, errors: err.errors});
      } else {
        quiz // save: guarda en DB campos pregunta y respuesta de quiz
        .save({fields: ["pregunta", "respuesta", "UserId", "image"]})
        .then( function(){ res.redirect('/quizes'); } ) 
      }      // res.redirect: Redirección HTTP a lista de preguntas
    }
  ).catch(function(error){next(error)});
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
  var quiz = req.quiz; // req.quiz: autoload de instancia de quiz
  res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
  if(req.files.image){
    req.quiz.image = req.files.image.name;
  }
  req.quiz.pregunta  = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;

  req.quiz
  .validate()
  .then(
    function(err){
      if (err) {
        res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
      } else {
        req.quiz     // save: guarda campos pregunta y respuesta en DB
        .save( {fields: ["pregunta", "respuesta", "image"]})
        .then( function(){ res.redirect('/quizes');});
      }     // Redirección HTTP a lista de preguntas (URL relativo)
    }
  ).catch(function(error){next(error)});
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
  req.quiz.destroy().then( function() {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};

//  console.log("req.quiz.id: " + req.quiz.id);