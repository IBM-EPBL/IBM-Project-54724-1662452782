const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { dirname } = require('path');
const { request } = require('express');

// Requiring dotenv and Creating variables to store the Env values to maintain a bit of secrecy
require("dotenv").config()
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE

const connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE
});

const app = express();

// setting the view engine to ejs -> as I wanted to render the user info dynamically, and have it viewed through an engine [This was the only possible way to render / pass values to HTML]

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

// http://localhost:3000/
app.get('/', function(request, response) {
    // Render login template
    response.sendFile(path.join(__dirname + '/login.html'))
})

// http://localhost:3000/auth
app.post('/auth', function(request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exist and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?',[username, password], function(error,results,fields){
            // If there is an issue with the  query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                request.session.loggedin = true;
                request.session.username = username;
                // Redirect to home page
                response.redirect('/home');
            } else {
                response.send('Incorrect Username and/or Password!');
                response.end();
            }
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
    // If the user is loggedin
    if (request.session.loggedin) {
        // Creating a home page for the users to be welcomed.
        response.sendFile(path.join(__dirname + '/home.html'));
        // // Output username
        // response.send('Welcome back, ' + request.session.username + '!');
    } else {
        // Not logged in
        response.send('Please login to view this page!');
    }
    //response.end();
    // Uncommenting this usually led me to have errors regarding 'Can't set headers after they are sent' -> so it meant that responses were closed, and communication wasn't possible after that ?
});

// http://localhost:3000/dashboard
app.post('/dashboard', function(request, response) {
    // Return the dashboard for the user if he is logged in.
    if (request.session.loggedin) {
        // Return the dashboard to be viewed for the user.
        response.sendFile(path.join(__dirname + '/dashboard.html'));
    } else {
        // Not logged in
        response.send('Please login to view this page!');
    }
    //response.end();
});

// http://localhost:3000/info
app.post('/info', function(request, response) {
    // Return the dashboard for the user if he is logged in.
    if (request.session.loggedin) {
        // Return the dashboard to be viewed for the user.
        response.sendFile(path.join(__dirname + '/info.html'));
    } else {
        // Not logged in
        response.send('Please login to view this page!');
    }
    //response.end();
});

// Add a port to enable the nodejs server to listen to incoming connections
// Ideally when we want to deploy our login system to a production server, we want to listen on port `80` so that we don't have to specify the port number in the URL.
app.listen(3000);