var express = require("express");
var passport = require('passport');
var app = express();

app.set('secret', (process.env.SECRET || 'keyboard cat'));

app.use(require('serve-static')(__dirname + '/public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: app.get('secret'), resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.set('port', (process.env.PORT || 5000));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

var server = app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
