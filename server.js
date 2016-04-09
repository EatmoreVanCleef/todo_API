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
  var body = _.pick(req.body, 'description', 'completed');
  var attrs = {};

  if (body.hasOwnProperty('description')) {
    attrs.description = body.description;
  }
  if (body.hasOwnProperty('completed')) {
    attrs.completed = body.completed;
  }

  db.todo.findById(todoId)
  .then(function(todo) {
    if (todo) {
      return todo.update(attrs)
        .then(function(todo){
          res.json(todo.toJSON());
        }, function(err) {
          res.status(400).json(err);
        });
    } else {
      res.status(404).json({
        error: 'No todo with that id.'
      });
    }
  }, function() {
    res.status(500).send();
  })
});

// POST /users
app.post('/users', function(req, res) {
  var body = _.pick(req.body, 'email', 'password');

  db.user.create({
    email: body.email,
    password: body.password
  }).then(function(user) {
    return res.json(user.toJSON());
  }).catch(function(err) {
    return res.status(400).json(err);
  })
});

db.sequelize.sync().then(function() {
  app.listen(PORT, function(){
    console.log('Express listening on port ' + PORT + '!');
  });
});
