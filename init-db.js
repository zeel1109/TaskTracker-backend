require('dotenv').config();
const mysql = require('mysql2');

// Create a connection to the database
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: {
    rejectUnauthorized: false
  }
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  
  console.log('Connected to the database successfully!');
  
  // First, check if the table exists and get its structure
  connection.query('SHOW TABLES LIKE "tasks"', (err, results) => {
    if (err) {
      console.error('Error checking if tasks table exists:', err);
      process.exit(1);
    }
    
    if (results.length === 0) {
      console.log('Tasks table does not exist. Creating it...');
      
      // Create tasks table
      const createTableQuery = `
        CREATE TABLE tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          status ENUM('To-Do', 'In Progress', 'Completed') NOT NULL,
          due_date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `;
      
      connection.query(createTableQuery, (err, result) => {
        if (err) {
          console.error('Error creating tasks table:', err);
          process.exit(1);
        }
        
        console.log('Tasks table created successfully');
        insertSampleTasks();
      });
    } else {
      console.log('Tasks table already exists');
      
      // Check the structure of the table
      connection.query('DESCRIBE tasks', (err, columns) => {
        if (err) {
          console.error('Error describing tasks table:', err);
          process.exit(1);
        }
        
        console.log('Tasks table structure:');
        columns.forEach(column => {
          console.log(`- ${column.Field} (${column.Type})`);
        });
        
        // Check if there are any tasks in the table
        connection.query('SELECT COUNT(*) as count FROM tasks', (err, results) => {
          if (err) {
            console.error('Error checking tasks count:', err);
            process.exit(1);
          }
          
          const count = results[0].count;
          console.log(`There are ${count} tasks in the database`);
          
          // If no tasks exist, insert some sample tasks
          if (count === 0) {
            insertSampleTasks();
          } else {
            process.exit(0);
          }
        });
      });
    }
  });
});

function insertSampleTasks() {
  const sampleTasks = [
    {
      name: 'Complete Project Proposal',
      description: 'Write and submit the project proposal document',
      status: 'To-Do',
      due_date: '2023-05-15'
    },
    {
      name: 'Review Code',
      description: 'Review the latest code changes and provide feedback',
      status: 'In Progress',
      due_date: '2023-05-10'
    },
    {
      name: 'Update Documentation',
      description: 'Update the project documentation with the latest changes',
      status: 'Completed',
      due_date: '2023-05-05'
    }
  ];
  
  const insertQuery = 'INSERT INTO tasks (name, description, status, due_date) VALUES ?';
  const values = sampleTasks.map(task => [task.name, task.description, task.status, task.due_date]);
  
  connection.query(insertQuery, [values], (err, result) => {
    if (err) {
      console.error('Error inserting sample tasks:', err);
      process.exit(1);
    }
    
    console.log(`${result.affectedRows} sample tasks inserted successfully`);
    process.exit(0);
  });
} 