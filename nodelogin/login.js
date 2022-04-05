const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { getSystemErrorMap } = require('util');

// create database connection
const connection = mysql.createConnection({
    host    : 'localhost',
    user    : 'root',
    password: 'root',
    database: 'nodelogin'
  });

// initialize express
  const app = express();

// declare express modules
// use sessions to determine if user is logged in or not, secret variable to secure session from hijacking
  app.use(session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
  }));

// json and urlencoded to extract form data from login.html
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// static method to locate css stylesheet located in /static folder
app.use(express.static(path.join(__dirname, '/static')));

// http://localhost:3000
app.get('/', function(request, response) {
    // output login.html page
    response.sendFile(path.join(__dirname + '/login.html'));
});

// http://localhost:3000/auth
app.post('/auth', function(request, response){
//initialize username and password fields for input
    let username = request.body.username;
    let password = request.body.password;


    if (username && password) {
// query database for valid username and password input
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
// in case of an error, the error will be printed to the browser console            
            if (error) console.log(error);
// check that the username and password fields are not empty, and redirect upon successful login to index page            
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;

                response.redirect('/index');
            } else {
// incorrect username/password, prompt for correction                
                response.send('Username and/or Password incorrect. Please try again or create an account if you do not have one.');
            }
            response.end();
        });
    }  else {
// empty username and password field, prompt for input        
        response.send('Please enter Username and Password to continue');
        response.end
      }
});

// load index page for user upon successful login
app.get('/index', function(request, response) { 
    if (request.session.loggedin) {
//send user to index
        response.send("hello, " + request.session.username);
    } else {
// if unsuccessful or nonexistent session, will automatically redirect to the login page        
        response.redirect('/login');
    }
    response.end();
});

app.listen(3000);


