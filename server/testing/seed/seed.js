const {ObjectID}= require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User}= require('./../../models/user');

const userOneId= new ObjectID();
const userTwoId= new ObjectID();
const users= [{
    _id: userOneId,
    email: 'testuser1@ramani.com',
    password: 'testUserOne',
    tokens: [{
        access: 'Auth',
        token: jwt.sign({ _id: userOneId, access: 'Auth'}, 'akhil').toString()
    }]
},{
    _id: userTwoId,
    email: 'testUser2@ramani.com',
    password: 'testUserTwo'
}]

const todos = [{
    _id: new ObjectID(),
    text : 'First testing todo'
},{
    _id: new ObjectID(),
    text: 'second testing todo',
    completed: true,
    completedAt: 333
}];

const populateTodos = (done)=>{
    Todo.deleteMany({}).then(()=>{
       return Todo.insertMany(todos);
    }).then(()=> done());
};

const populateUsers = (done)=>{
    User.deleteMany({}).then(()=>{
        var userOne= new User(users[0]).save();
        var userTwo= new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(()=> done());
};

module.exports = {todos, populateTodos, users, populateUsers};