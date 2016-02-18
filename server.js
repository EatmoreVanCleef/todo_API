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
  var queryParams = req.query;
  var filtered = todos;

  if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
    filtered = _.where(filtered, {completed: true});
  } else if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'false') {
    filtered = _.where(filtered, {completed: false});
  }
  if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
    filtered = _.filter(filtered, function(todo) {
      return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
    });
  }

  res.json(filtered);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
  // params returns a string, todo.id is an integer (base 10)
  var todoId = parseInt(req.params.id, 10);
  // _.findWhere(arrayToSearch, {attribute(s): toFilterBy});
  var matched = _.findWhere(todos, {id: todoId});

  if (matched) {
    res.json(matched);
  } else {
    res.status(404).send();
  }
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

  //success: res.status(200)return with toJSON
  //fail: res.status(400).json(e);

  // if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
  //   return res.status(400).send();
  // }
  // // use _.trim to trim whitespace from body.description
  // body.description = body.description.trim();
  // body.id = todoNextId++;
  // todos.push(body);
  // res.json(body);
  // return body;
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
  var todoId = parseInt(req.params.id, 10);
  var matched = _.findWhere(todos, {id: todoId});

  if (!matched) {
    return res.status(404).json({"error": "Nothing found with that ID."});
  } else {
    todos = _.without(todos, matched);
    res.json(matched);
  }
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
