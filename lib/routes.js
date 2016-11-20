

function configureRoutes(app, passport) {

    app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
    });

    app.get('/currentCozmoImage', function (req, res) {
        rpcStub.handleImageGetEvent({}, function(error, img) {
            res.end(img.image, 'binary');
        });
    });

    app.get('/auth',
        passport.authenticate('twitchtv', { scope: [ 'user_read' ] }),
        function(req, res){}
    );

    app.get('/auth/callback', 
        passport.authenticate('twitchtv', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/');
        }
    );

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
}

module.exports = configureRoutes;