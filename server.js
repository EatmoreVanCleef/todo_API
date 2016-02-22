var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.send('Todo API root.')
});

// GET /todos?completed=boolean&q=string
// (if no params, GET all)
app.get('/todos', function(req, res) {
  var query = req.query;
  var where = {};

  if (query.hasOwnProperty('completed') && query.completed === 'true') {
    where.completed = true;
  } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
    where.completed = false;
  }
  if (query.hasOwnProperty('q') && query.q.length > 0) {
    where.description = {
      $like: '%'+ query.q + '%'
    };
  }

  db.todo.findAll({where: where}).then(function(todos) {
    res.json(todos);
  }).catch(function(err) {
    res.status(500).send();
  });
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
  // params returns a string, todo.id is an integer (base 10)
  var todoId = parseInt(req.params.id, 10);

  db.todo.findById(todoId).then(function(todo) {
    if (!!todo) { // !! returns truthy/falsey
      return res.json(todo.toJSON());
    } else {
      return res.status(404).send();
    }
  }).catch(function(err) {
    return res.status(500).json(err);
  })
});

// POST /todos
app.post('/todos', function(req, res) {
  // use _.pick to sanitize req.body object
  var body = _.pick(req.body, 'description', 'completed');

  db.todo.create({
    description: body.description,
    completed: body.completed
  }).then(function(todo) {
    return res.json(todo.toJSON());
  }).catch(function(err) {
    return res.status(400).json(err);
  })
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matched = db.todo.findById(todoId);

  db.todo.destroy({
    where: {
      id: todoId
    }
  }).then(function(affectedRows) {
    if (affectedRows === 0) {
      res.status(404).json({
        error: 'No todo with that id'
      });
    } else {
      res.status(204).send();
    }
  }).catch(function(err) {
    res.status(500).send();
  })
});

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matched = _.findWhere(todos, {id: todoId});
  var body = _.pick(req.body, 'description', 'completed');
  var validAttrs = {};

  if (!matched) {
    return res.status(404).send();
  }

  if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
    validAttrs.completed = body.completed;
  } else if (body.hasOwnProperty('completed')) {
    return res.status(400).send();
  }
  if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
    validAttrs.description = body.description;
  } else if (body.hasOwnProperty('description')) {
    return res.status(400).send();
  }
  // _.extend(targetObject, ValsToOverwriteOrAddObj)
  _.extend(matched, validAttrs);
  res.json(matched);

});

db.sequelize.sync().then(function() {
  app.listen(PORT, function(){
    console.log('Express listening on port ' + PORT + '!');
  });
});
