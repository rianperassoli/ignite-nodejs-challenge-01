const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ error: "User not found!" })
  }

  request.user = user

  return next()
}

function checksExistsTodo(request, response, next) {
  const { user } = request
  const { id } = request.params

  let todo = user.todos.find(todo => todo.id === id)

  if (!todo) {
    return response.status(404).json({ error: "Todo not found!" })
  }

  request.todo = todo

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userExists = users.some(user => user.username === username)

  if (userExists) {
    return response.status(400).json({
      error: 'User already exists!'
    })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title,
    deadline,
    done: false,
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todo } = request
  const { title, deadline } = request.body

  const todoToUpdate = { ...todo, title, deadline }

  user.todos = user.todos.map(todo => {
    if (todo.id === todoToUpdate.id) {
      return todoToUpdate
    }
    return todo
  })

  return response.json(todoToUpdate)
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todo } = request

  const todoToUpdate = { ...todo, done: true }

  user.todos = user.todos.map(todo => {
    if (todo.id === todoToUpdate.id) {
      return todoToUpdate
    }
    return todo
  })

  return response.json(todoToUpdate)
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user, todo } = request

  user.todos.splice(todo, 1)

  return response.status(204).send()
});

module.exports = app;