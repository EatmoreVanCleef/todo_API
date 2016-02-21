var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
  description: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      len: [1, 250]
    }
  },
  completed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

sequelize.sync({
  // force: true
}).then(function() {
  console.log('Everything is synced.');

  Todo.findById(225)
  .then(function(todo) {
    if (todo) {
      console.log(todo.toJSON());
    } else {
      console.log('ERROR: todo with that ID not found.');
    }
  })
  .catch(function(err) {
    console.log(err);
  });

  // Todo.create({
  //   description: 'Wash dishes',
  //   // completed: false
  // }).then(function(todo) {
  //   return Todo.create({
  //     description: 'Brush teeth'
  //   });
  // }).then(function() {
  //   return Todo.findAll({
  //     where: {
  //       completed: false
  //     }
  //   });
  // }).then(function(todos) {
  //   if (todos) {
  //     todos.forEach(function (todo) {
  //       console.log(todo.toJSON());
  //     })
  //   } else {
  //     console.log('No Todo found.');
  //   }
  // }).catch(function(err) {
  //   console.log('ERROR:');
  //   console.log(err);
  // });
});
