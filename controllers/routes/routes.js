const User = require('../../models/user');
const Chirp = require('../../models/chirp');
const passport = require('passport');

module.exports = function(app) { 
  //Landing page
  app.get('/', function(req, res){
    res.render('landing');
  });

  //"Sign up" for a user account
  app.get('/createUser', function(req, res){
    res.render('createUser');
  });

  //Create new User
  app.post('/createUser', function(req, res){
    req.body.username
    req.body.password
    //All of the values from sign-up inputs are added to "user" object 
    User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
      if (err) {
        console.log(err);
        return res.render('createUser');
      }
      passport.authenticate('local')(req, res, function() {
        res.redirect('/timeline');
      });
    });

    //========== End of storing user data refactoring 

    // User.create(req.body.user, function(err, user){ 
    //   if(err){
    //     res.render('createUser');
    //   } else {
    //     //Does anything else need to happen here?
    //     //Should this redirect to '/timeline/:username/'?
    //     res.redirect('/timeline/');
    //   }
    // });
  });

  //Create new Chirp
  app.post('/timeline/:username/createChirp', function(req, res){   //Change to POST
  //Search for this user. (This will be replaced by middlware).
    User.findOne({email: "kwest@gmail.com"}, function(err, currentUser){ 
      //If the search itself errors...
      if(err){
        console.log(err);
        res.send('Something went wrong when trying to find the User...');
      } 
      //If the search doesn't find a match.  
      else if (currentUser === null) {
          res.send('User not found; so chirp NOT created');
      }
      //User was found; create and add the chirp to this User's chirps.
      else {
        Chirp.create(
          {
            body: req.body.newChirpBody,
            user: currentUser._id 
          }, 
          function(error, newChirp){
            currentUser.chirps.push(newChirp);
            currentUser.save();
            console.log(currentUser.username + ' just chirped: "' + newChirp.body + '"');
            res.send(currentUser.chirps); //change to res.reload to timeline?
        });       
      }
    });
  });

  app.get('/timeline', isLoggedIn, function(req, res){
    res.render('timeline');
  });

}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
