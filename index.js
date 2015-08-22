//////////////////////////////////////////////////////////////////
// REQUIREs
//////////////////////////////////////////////////////////////////
var express = require("express");
var Waterline = require('waterline');
var passport = require('passport');
var EveOnlineStrategy = require('passport-eveonline');
var postgres = require('sails-postgresql');

var app = express();
var orm = new Waterline();

//////////////////////////////////////////////////////////////////
// ENV VARs
//////////////////////////////////////////////////////////////////

app.set('secret', process.env.SECRET);
app.set('EVEONLINE_CLIENT_ID', process.env.EVEONLINE_CLIENT_ID);
app.set('EVEONLINE_SECRET_KEY', process.env.EVEONLINE_SECRET_KEY);
app.set('EVEONLINE_AUTH_HOST', process.env.EVEONLINE_AUTH_HOST);
app.set('HOST', process.env.HOST);
app.set('DATABASE_URL', process.env.DATABASE_URL);
app.set('port', (process.env.PORT || 5000));

//////////////////////////////////////////////////////////////////
// WATERLINE SETUP
//////////////////////////////////////////////////////////////////

var config = {
    adapters: {
        'default': postgres,
        postgres: postgres
    },
    connections: {
        herokuPostgres: {
            adapter: 'postgres',
            url: app.get('DATABASE_URL'),
            pool: false,
            ssl: true
        }
    },
    defaults: {
        migrate: 'alter'
    }
};

//////////////////////////////////////////////////////////////////
// WATERLINE MODELs
//////////////////////////////////////////////////////////////////

var Routes = Waterline.Collection.extend({

  identity: 'routes',
  connection: 'herokuPostgres',

  attributes: {
    origin: 'string',
    destination: 'string',
    price: 'integer'
  }
});

//////////////////////////////////////////////////////////////////
// EXPRESS SETUP
//////////////////////////////////////////////////////////////////

app.use(require('serve-static')(__dirname + '/public'));
app.use(require('cookie-parser')());
app.use(require('body-parser').json());
app.use(require('express-session')(
    {
        secret: app.get('secret'),
        resave: true,
        saveUninitialized: true
        
    })
);
app.use(passport.initialize());
app.use(passport.session());

//////////////////////////////////////////////////////////////////
// PASSPORT SETUP
//////////////////////////////////////////////////////////////////

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
    done(null, name);
});

//////////////////////////////////////////////////////////////////
// EXPRESS API ROUTING
//////////////////////////////////////////////////////////////////

app.get('/routes/all', function(req, res) {
    app.models.routes.find().exec(function(err, models) {
        if(err) return res.status(500).json({ err: err });
        res.json(models);
    });
});

app.post('/routes/search', function(req, res) {
    app.models.routes
        .find()
        .where(req.body)
        .exec(
            function(err, model) {
                if(err) return res.status(500).json({ err: err });
                res.json(model);
        });
});

app.post('/routes/create', function(req, res) {
    app.models.routes
        .create(req.body,
        function(err, model) {
            if(err) return res.status(500).json({ err: err });
            res.json(model);
        });
});

app.post('/routes/delete', function(req, res) {
    app.models.routes
        .destroy(req.body,
            function(err) {
                if(err) return res.status(500).json({ err: err });
                res.json({ status: 'ok' });
            });
});

app.get('/auth/status', function(req, res){
    if(req.user) {
        //res.status(200).send({ message: 'Keep moving! ;)' });
        res.Next();
    } else {
        res.status(401).send({ message: 'None shall pass!' });
    }
});

//////////////////////////////////////////////////////////////////
// EXPRESS WEB ROUTING
//////////////////////////////////////////////////////////////////

app.get('/', function (req, res) {
    res.send('Welcome foreigner!');
});

app.get('/admin', function (req, res) {
    res.send('Welcome Mr. ' + req.user + '!');
});

app.get('/error', function (req, res) {
    res.send('We couldn\'t authenticate you, sorry.');
});

//////////////////////////////////////////////////////////////////
// EXPRESS AUTH ROUTING
//////////////////////////////////////////////////////////////////

app.get('/auth/eveonline',
    passport.authenticate('eveonline')
);

app.get('/auth/eveonline/callback',
    passport.authenticate('eveonline', {
        successRedirect: '/admin',
        failureRedirect: '/error',
    })
);

//////////////////////////////////////////////////////////////////
// STARTUP
//////////////////////////////////////////////////////////////////

orm.loadCollection(Routes);
orm.initialize(config, function(err, models) {
    if(err) throw err;

    app.models = models.collections;
    app.connections = models.connections;
    
    app.listen(app.get('port'), function () {
        console.log('Node app is running on port', app.get('port'));
    });
});
