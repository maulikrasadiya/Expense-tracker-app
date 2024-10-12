let express = require('express');
let route = express();
let multer = require('../multer/multer')
let controller = require('../controllers/expenseController');
const  { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');

route.post('/create', authenticateUser, controller.createExpense);
route.get('/all', authenticateUser,authorizeAdmin, controller.getExpense);
route.put('/:id', authenticateUser, controller.updateExpense);
route.delete('/:id', authenticateUser, controller.deleteExpense);
route.post('/upload-expenses-csv', authenticateUser, multer.single('file'), controller.uploadCSV);
route.delete('/bulk-delete', authenticateUser, controller.bulkDeleteExpenses);

module.exports = route