var express = require('express');
var crypto = require('crypto');
var router = express.Router();

const generateAuthToken = () => {
  return crypto.randomBytes(30).toString('hex');
}
/* GET users listing. */
router.get('/', function(req, res, next) {
 console.log(req.app.locals.users);
  res.render('login', { title : "Login",
  message: 'Please login to continue',
  messageClass: 'alert-danger'});
});
router.post('/', function(req, res, next) {
  const { email, password } = req.body;
  var user = req.app.locals.users.find(u => {
      return u.email === email && password === u.password
  }); 
  console.log(user)
  if (user) {
      const authToken = generateAuthToken();
      user.token.push(authToken) 
      // Setting the auth token in cookies
      res.cookie('AuthToken', authToken);
      // Redirect user to the protected page
      res.redirect('/welcome');
  } else {
      res.render('login', {
        title: 'Login',
          message: 'Invalid username or password',
          messageClass: 'alert-danger'
      });
  }
});
module.exports = router;
