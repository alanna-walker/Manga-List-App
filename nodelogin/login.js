const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { getSystemErrorMap } = require('util');

const connection = mysql.createConnection({
    host    : 'localhost',
    user    : 'root',
    password: 'root',
    database: 'nodelogin'
  });

  const app = express();

  app.use(session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
  }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/static')));

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});

app.post('/auth', function(request, response){
    let username = request.body.username;
    let password = request.body.password;

    if (username && password) {

        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            if (error) console.log(error);
            if (results.length > 0) {
                request.session.loggedin = true;
                request.session.username = username;

                response.redirect('/index');
            } else {
                response.send('Username and/or Password incorrect. Please try again or create an account if you do not have one.');
            }
            response.end();
        });
    }  else {
        response.send('Please enter Username and Password to continue');
        response.end
      }
});

app.get('/index', function(request, response) { 
    if (request.session.loggedin) {
        response.send('Hello, ' + request.session.username);
    } else {
        response.redirect('/login');
    }
    response.end();
});

app.listen(3000);


