const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration with connection pooling settings
const pool = new Pool({
    host: process.env.DB_HOST || '78.26.183.187',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'Access_list_DB',
    user: process.env.DB_USER || 'rico',
    password: process.env.DB_PASSWORD || 'Hys7ghh$90hasygHen$$101',
    ssl: false,
    // Connection pool settings to help with stability
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
});

// Enhanced error handling for database connection
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Test database connection with better error handling
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database');
        client.release();
    } catch (err) {
        console.error('Error connecting to database:', err.message);
        console.log('Database connection failed, but server will continue running...');
    }
};

testConnection();

// API Routes

// Get all tables in the database
app.get('/api/tables', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching tables:', err.message);
        res.status(500).json({ 
            error: 'Failed to fetch tables',
            details: err.message 
        });
    } finally {
        if (client) client.release();
    }
});

// Get data from a specific table
app.get('/api/data/:tableName', async (req, res) => {
    let client;
    try {
        const { tableName } = req.params;
        const limit = req.query.limit || 100;

        client = await pool.connect();

        // Validate table name to prevent SQL injection
        const validTables = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = $1
        `, [tableName]);

        if (validTables.rows.length === 0) {
            return res.status(404).json({ error: 'Table not found' });
        }

        // Get table structure
        const columns = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = $1 AND table_schema = 'public'
            ORDER BY ordinal_position;
        `, [tableName]);

        // Get table data with better error handling
        let data;
        try {
            data = await client.query(`SELECT * FROM "${tableName}" ORDER BY timestamp DESC LIMIT $1`, [limit]);
        } catch (queryErr) {
            // If timestamp column doesn't exist, try without ORDER BY
            console.log('Timestamp column not found, fetching without ordering');
            data = await client.query(`SELECT * FROM "${tableName}" LIMIT $1`, [limit]);
        }

        res.json({
            tableName,
            columns: columns.rows,
            data: data.rows,
            totalRows: data.rows.length
        });
    } catch (err) {
        console.error('Error fetching data:', err.message);
        res.status(500).json({ 
            error: 'Failed to fetch data from table',
            details: err.message 
        });
    } finally {
        if (client) client.release();
    }
});

// Get table statistics
app.get('/api/stats/:tableName', async (req, res) => {
    let client;
    try {
        const { tableName } = req.params;

        client = await pool.connect();
        const countResult = await client.query(`SELECT COUNT(*) as total FROM "${tableName}"`);

        res.json({
            tableName,
            totalRecords: parseInt(countResult.rows[0].total)
        });
    } catch (err) {
        console.error('Error fetching stats:', err.message);
        res.status(500).json({ 
            error: 'Failed to fetch table statistics',
            details: err.message 
        });
    } finally {
        if (client) client.release();
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    let dbStatus = 'disconnected';
    let client;
    
    try {
        client = await pool.connect();
        await client.query('SELECT 1');
        dbStatus = 'connected';
    } catch (err) {
        console.error('Database health check failed:', err.message);
    } finally {
        if (client) client.release();
    }

    res.json({ 
        status: 'Server is running', 
        database: dbStatus,
        timestamp: new Date().toISOString() 
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await pool.end();
    process.exit(0);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API endpoints available at http://localhost:${port}/api`);
});