const mongoose = require('mongoose');
const Expense = require('../models/expensemodel');
const fs = require('fs');
const csv = require('csv-parser');

const createExpense = async (req, res) => {
    const { title = 'Untitled', amount, category, paymentMethod, date = new Date() } = req.body;

    if (!amount || !category || !paymentMethod) {
        return res.status(400).json({ message: 'Amount, category, and payment method are required' });
    }

    try {
        const newExpense = new Expense({ title, amount, category, paymentMethod, date, user: req.user.id });
        await newExpense.save();
        return res.status(201).json({ message: 'Expense created successfully', data: newExpense });
    } catch (error) {
        return res.status(500).json({ message: 'Error creating expense', error: error.message });
    }
};

const getExpense = async (req, res) => {
    const userId = req.user.id;
    const { category, paymentMethod, startDate, endDate, sortBy, sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    const filter = { user: userId };
    if (category) {
        filter.category = category;
    }
    if (paymentMethod) {
        filter.paymentMethod = paymentMethod;
    }
    if (startDate || endDate) {
        filter.date = {};
        if (startDate) {
            filter.date.$gte = new Date(startDate);
        }
        if (endDate) {
            filter.date.$lte = new Date(endDate);
        }
    }

    const sort = sortBy ? { [sortBy]: sortOrder === 'asc' ? 1 : -1 } : { date: -1 };
    const validPage = Math.max(1, parseInt(page));
    const validLimit = Math.min(Math.max(1, parseInt(limit)), 100);
    const skip = (validPage - 1) * validLimit;

    try {
        const expenses = await Expense.find(filter).sort(sort).skip(skip).limit(validLimit);
        const totalExpenses = await Expense.countDocuments(filter);
        return res.json({
            expenses,
            totalExpenses,
            totalPages: Math.ceil(totalExpenses / validLimit),
            currentPage: validPage
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );

        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        return res.json({ message: 'Expense updated successfully', data: expense });
    } catch (error) {
        return res.status(500).json({ message: 'Error updating expense', error: error.message });
    }
};

const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        return res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting expense', error: error.message });
    }
};

const uploadCSV = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const expenses = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (row) => {
            const expense = {
                title: row.title || 'Untitled',
                amount: parseFloat(row.amount),
                category: row.category || 'Miscellaneous',
                paymentMethod: row.paymentMethod?.toLowerCase() || 'cash',
                date: row.date ? new Date(row.date) : new Date(),
                user: req.user.id
            };
            if (!isNaN(expense.amount)) {
                expenses.push(expense);
            }
        })
        .on('end', async () => {
            try {
                await Expense.insertMany(expenses);
                fs.unlinkSync(req.file.path); // Clean up uploaded file
                return res.status(201).json({ message: 'Expenses uploaded successfully', data: expenses });
            } catch (error) {
                return res.status(500).json({ message: 'Error saving expenses', error: error.message });
            }
        })
        .on('error', (error) => {
            return res.status(500).json({ message: 'Error processing CSV file', error: error.message });
        });
};

const bulkDeleteExpenses = async (req, res) => {
    const { expenseIds } = req.body;
    if (!expenseIds || expenseIds.length === 0) {
        return res.status(400).json({ message: 'No expense IDs provided for deletion' });
    }

    try {
        const result = await Expense.deleteMany({ _id: { $in: expenseIds }, user: req.user.id });
        return res.status(200).json({ message: 'Expenses deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting expenses', error: error.message });
    }
};

module.exports = {
    createExpense,
    getExpense,
    updateExpense,
    deleteExpense,
    uploadCSV,
    bulkDeleteExpenses,
};
