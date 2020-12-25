var express = require('express');
var router = express.Router();
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('intro', { title: 'Welcome' });
});
module.exports = router;
