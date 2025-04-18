const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all tasks
router.get('/', (req, res) => {
  db.query('SELECT * FROM tasks ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ 
        error: 'Database error', 
        message: err.message,
        code: err.code
      });
    }
    res.json(results);
  });
});

// Add a task
router.post('/', (req, res) => {
  const { taskName, description, status, dueDate } = req.body;
  
  if (!taskName || !description) {
    return res.status(400).json({ 
      error: 'Validation error', 
      message: 'Task name and description are required' 
    });
  }
  
  // Map the frontend field names to database column names
  const task = {
    name: taskName,
    description: description,
    status: status || 'To-Do', // Use default if not provided
    due_date: dueDate
  };
  
  db.query(
    'INSERT INTO tasks (name, description, status, due_date) VALUES (?, ?, ?, ?)',
    [task.name, task.description, task.status, task.due_date],
    (err, result) => {
      if (err) {
        console.error('Error adding task:', err);
        if (err.code === 'ER_BAD_FIELD_ERROR') {
          return res.status(500).json({
            error: 'Database error',
            message: 'Invalid field name in the request',
            code: err.code
          });
        }
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message,
          code: err.code
        });
      }
      
      // After successful insert, fetch the created task
      db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId], (err, tasks) => {
        if (err) {
          console.error('Error fetching created task:', err);
          return res.json({ id: result.insertId });
        }
        res.json(tasks[0]);
      });
    }
  );
});

// Update status
router.put('/:id', (req, res) => {
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ 
      error: 'Validation error', 
      message: 'Status is required' 
    });
  }
  
  if (!['To-Do', 'In Progress', 'Completed'].includes(status)) {
    return res.status(400).json({
      error: 'Validation error',
      message: 'Invalid status value. Must be one of: To-Do, In Progress, Completed'
    });
  }
  
  db.query(
    'UPDATE tasks SET status = ? WHERE id = ?',
    [status, req.params.id],
    (err, result) => {
      if (err) {
        console.error('Error updating task:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message,
          code: err.code
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Not found', 
          message: 'Task not found' 
        });
      }
      
      // After successful update, fetch the updated task
      db.query('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, tasks) => {
        if (err) {
          console.error('Error fetching updated task:', err);
          return res.json({ message: 'Status updated successfully' });
        }
        res.json(tasks[0]);
      });
    }
  );
});

// Delete task
router.delete('/:id', (req, res) => {
  db.query(
    'DELETE FROM tasks WHERE id = ?',
    [req.params.id],
    (err, result) => {
      if (err) {
        console.error('Error deleting task:', err);
        return res.status(500).json({ 
          error: 'Database error', 
          message: err.message,
          code: err.code
        });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          error: 'Not found', 
          message: 'Task not found' 
        });
      }
      
      res.json({ message: 'Task deleted successfully', id: req.params.id });
    }
  );
});

module.exports = router;
