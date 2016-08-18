// requiring necessary modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// instantiating necessary variables
const app = express();
const connection = mongoose.connection;
const Schema = mongoose.Schema;

// overwriten the promises
mongoose.Promise = global.Promise;

// connecting to the DB
mongoose.connect('mongodb://localhost/scrumdb');

// checking if the connection was succesfull
connection.on('error', () => console.log('CONNECTION ERROR TO THE DATABASE'));
connection.once('open', () => console.log('Already connected'));

// creating the Task Schema
const taskSchema = new Schema({
  status: String,
  description: String,
  user: {
    type: Number,
    ref: 'User'
  }
});

// creating the User Schema
const userSchema = new Schema({
  _id: {
    type: Number,
    required: true,
    unique: true
  },
  name: String
});

// compiling the models
const Task = mongoose.model('Task', taskSchema);
const User = mongoose.model('User', userSchema);

// before routing, setting up the middle-wares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());



// routing

// global route
app.get('/', (req, res) => {
  res.end('Server is working');
});



// Getting all tasks and users
app.get('/tasks-users', (req, res) => {
  Task.find()
    .populate('user')
    .then((returnedTasks) => {
      var response = '';
      for(var i = 0; i < returnedTasks.length; i++)
        response += `<p>${returnedTasks[i]}</p>`
      res.end(`<p>${response}</p>`);
    })
    .catch((e) => console.log('Error: ', e.message));
});


// Posting a new task
// app.post('/tasks/new', (req, res) => {
//   const newTask = new Task(req.body);
//   newTask.save()
//     .then(savedTask => res.json(savedTask))
//     .catch(e => console.log('Error: ', e.message));
// });



// listening
app.listen(3000, () => console.log('Server is listening at port 3000'));



// function to create the routes
function createRoutes(route, model){
  var theroute = '/' + route;

  // GET ALL
  app.get(theroute, (req, res) => {
    model.find()
      .then((returned) => {
        var response = '';
        for(var i = 0; i < returned.length; i++)
          response += `<p>${returned[i]}</p>`
        res.end(`<p>${response}</p>`);
      })
      .catch((e) => console.log('Error: ', e.message));
  });


  // GET ONE
  app.get(theroute + '/:id', (req, res) => {
    model.findById(req.params.id)
      .then((returned) => {
        var response = '';
        res.end(`<p>${returned}</p>`);
      })
      .catch((e) => console.log('Error: ', e.message));
  });


  // UPDATE
  app.put(theroute + '/:id', (req, res) => {
    model.findById(req.params.id)
      .then(returned => {
        Object.assign(returned, req.body);

        returned.save()
          .then(saved => res.json(saved))
          .catch(e => console.log('Error: ', e.message));
      })
      .catch(e => console.log('Error: ', e.message));
  });


  // DELETE
  app.delete(theroute + '/:id', (req, res) => {
    model.findByIdAndRemove(req.params.id)
      .then(deleted => res.json(deleted))
      .catch((e) => console.log('Error: ', e.message));
  });


  // POST
  app.post(theroute, (req, res) => {
    const newObj = new model(req.body);
    newObj.save()
      .then(saved => res.json(saved))
      .catch(e => console.log('Error: ', e.message));
  });
}


createRoutes('tasks', Task);
createRoutes('users', User);
