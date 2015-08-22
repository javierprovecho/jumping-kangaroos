var express = require("express");

var app = express();

var passport = require('passport');

app.set('secret', process.env.SECRET);

app.use(require('serve-static')(__dirname + '/public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')(
    {
        secret: app.get('secret'),
        resave: true,
        saveUninitialized: true
        
    })
);
app.use(passport.initialize());
app.use(passport.session());

var EveOnlineStrategy = require('passport-eveonline')

app.set('EVEONLINE_CLIENT_ID', process.env.EVEONLINE_CLIENT_ID);
app.set('EVEONLINE_SECRET_KEY', process.env.EVEONLINE_SECRET_KEY);
app.set('EVEONLINE_AUTH_HOST', process.env.EVEONLINE_AUTH_HOST);
app.set('HOST', process.env.HOST);

passport.use(new EveOnlineStrategy({
        clientID: app.get('EVEONLINE_CLIENT_ID'),
        clientSecret: app.get('EVEONLINE_SECRET_KEY'),
        callbackURL: app.get('HOST') + '/auth/eveonline/callback',
        authorizationURL: app.get('EVEONLINE_AUTH_HOST') + '/oauth/authorize',
        tokenURL: app.get('EVEONLINE_AUTH_HOST') + '/oauth/token',
        verifyURL: app.get('EVEONLINE_AUTH_HOST') + '/oauth/verify'
    },
    function(user, done) {
        var name = user.CharacterName;
        var strippedName = name.split(' ').join('');
        done(null, (!!process.env['User' + strippedName] ? name : false));
    }
));

passport.serializeUser(function(name, done) {
    done(null, name);
});

passport.deserializeUser(function(name, done) {
    done(null, name)
});

app.get('/', function (req, res) {
    res.send('Welcome foreigner!');
});

app.get('/admin', function (req, res) {
    res.send('Welcome Mr. ' + req.user + '!');
});

app.get('/error', function (req, res) {
    res.send('We couldn\'t authenticate you, sorry.');
});

app.get('/auth/status', function(req, res){
    if(req.user) {
        res.status(200).send({ message: 'Keep moving! ;)' });
    } else {
        res.status(401).send({ message: 'None shall pass!' });
    }
});

app.get('/auth/eveonline',
    passport.authenticate('eveonline')
);

app.get('/auth/eveonline/callback',
    passport.authenticate('eveonline', {
        successRedirect: '/admin',
        failureRedirect: '/error',
    })
);

app.set('port', (process.env.PORT || 5000));

var server = app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
