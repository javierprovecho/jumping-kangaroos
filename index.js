var express = require("express");

var app = express();

var passport = require('passport');

app.set('secret', process.env.SECRET);

app.use(require('serve-static')(__dirname + '/public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: app.get('secret'), resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

var EveOnlineStrategy = require('passport-eveonline')

app.set('EVEONLINE_CLIENT_ID', process.env.EVEONLINE_CLIENT_ID);
app.set('EVEONLINE_SECRET_KEY', process.env.EVEONLINE_SECRET_KEY);
app.set('HOST', process.env.HOST);

passport.use(new EveOnlineStrategy({
        clientID: app.get('EVEONLINE_CLIENT_ID'),
        clientSecret: app.get('EVEONLINE_SECRET_KEY'),
        callbackURL: app.get('HOST') + '/auth/eveonline/callback'
    },
    function(characterInformation, done) {
        console.log(characterInformation);
        User.findOrCreate(
            { characterID: characterInformation.characterID },
            function (err, user) {
                return done(err, user);
            }
        );
    }
));

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/auth/eveonline',
    passport.authenticate('eveonline')
);

app.get('/auth/eveonline/callback',
    passport.authenticate('eveonline', {
        successRedirect: '/',
        failureRedirect: '/login'
    })
);

app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
