let express = require('express');
let route = express();
let controller = require('../controllers/userContoller')

route.get('/',controller.defaults);
route.post('/register',controller.register);
route.post('/login',controller.login);
route.get('/login',controller.logout);

module.exports = route