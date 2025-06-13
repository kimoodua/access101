const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const pool = new Pool({
    host: process.env.DB_HOST || '78.26.183.187',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'Access_list_DB',
    user: process.env.DB_USER || 'rico',
    password: process.env.DB_PASSWORD || 'Hys7ghh$90hasygHen$$101',
    ssl: false,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Successfully connected to PostgreSQL database');
        release();
    }
});

// API Routes

// Get all tables in the database
app.get('/api/tables', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tables:', err);
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
});

// Get data from a specific table
app.get('/api/data/:tableName', async (req, res) => {
    try {
        const { tableName } = req.params;
        const limit = req.query.limit || 100;

        // Validate table name to prevent SQL injection
        const validTables = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = $1
        `, [tableName]);

        if (validTables.rows.length === 0) {
            return res.status(404).json({ error: 'Table not found' });
        }

        // Get table structure
        const columns = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = $1 AND table_schema = 'public'
            ORDER BY ordinal_position;
        `, [tableName]);

        // Get table data
        const data = await pool.query(`SELECT * FROM "${tableName}" ORDER BY timestamp DESC LIMIT $1`, [limit]);

        res.json({
            tableName,
            columns: columns.rows,
            data: data.rows,
            totalRows: data.rows.length
        });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({ error: 'Failed to fetch data from table' });
    }
});

// Get table statistics
app.get('/api/stats/:tableName', async (req, res) => {
    try {
        const { tableName } = req.params;

        const countResult = await pool.query(`SELECT COUNT(*) as total FROM "${tableName}"`);

        res.json({
            tableName,
            totalRecords: parseInt(countResult.rows[0].total)
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Failed to fetch table statistics' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API endpoints available at http://localhost:${port}/api`);
});