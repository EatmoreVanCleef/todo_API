var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
  id: 1,
  description: 'wash dishes',
  completed: false
}, {
  id: 2,
  description: 'make bed',
  completed: false
}, {
  id: 3,
  description: 'feed bird',
  completed: true
}];

app.get('/', function(req, res) {
  res.send('Todo API root.')
});

// GET /todos
app.get('/todos', function(req, res) {
  res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
  // params returns a string, todo.id is an integer
  var todoId = parseInt(req.params.id, 10);
  var matched;
  todos.forEach(function(item) {
    if (todoId === item.id) {
      matched = item;
    }
  });
  if (matched) {
    res.json(matched);
  } else {
    res.status(404).send();
  }
});

app.listen(PORT, function(){
  console.log('Express listening on port ' + PORT + '!');
});
