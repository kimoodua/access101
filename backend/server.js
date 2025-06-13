const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration optimized for WebContainer environment
const pool = new Pool({
    host: process.env.DB_HOST || '78.26.183.187',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'Access_list_DB',
    user: process.env.DB_USER || 'rico2',
    password: process.env.DB_PASSWORD || 'Hys7ghh$90hasygHen$$101',
    ssl: false,
    // Optimized connection settings for WebContainer
    max: 5, // Reduced pool size for WebContainer
    idleTimeoutMillis: 10000, // Shorter idle timeout
    connectionTimeoutMillis: 5000, // Increased connection timeout
    maxUses: 1000, // Reduced max uses
    // Additional settings for better connectivity
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Retry configuration
    application_name: 'sms_dashboard_webcontainer',
    statement_timeout: 30000,
    query_timeout: 30000,
});

// Enhanced error handling for database connection
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    // Don't exit the process in WebContainer, just log the error
    console.log('Database pool error occurred, but server will continue...');
});

pool.on('connect', (client) => {
    console.log('New database client connected');
});

pool.on('acquire', (client) => {
    console.log('Database client acquired from pool');
});

pool.on('remove', (client) => {
    console.log('Database client removed from pool');
});

// Enhanced connection test with retry logic
const testConnection = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempting database connection (attempt ${i + 1}/${retries})...`);
            const client = await pool.connect();
            
            // Test with a simple query
            const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
            console.log('Successfully connected to PostgreSQL database');
            console.log('Database time:', result.rows[0].current_time);
            console.log('PostgreSQL version:', result.rows[0].pg_version.split(' ')[0]);
            
            client.release();
            return true;
        } catch (err) {
            console.error(`Database connection attempt ${i + 1} failed:`, err.message);
            console.error('Error details:', {
                code: err.code,
                errno: err.errno,
                syscall: err.syscall,
                address: err.address,
                port: err.port
            });
            
            if (i < retries - 1) {
                console.log(`Retrying in 2 seconds...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    
    console.log('All database connection attempts failed, but server will continue running...');
    return false;
};

// Test connection on startup
testConnection();

// API Routes with enhanced error handling

// Health check endpoint with detailed database status
app.get('/api/health', async (req, res) => {
    let dbStatus = 'disconnected';
    let dbDetails = {};
    let client;
    
    try {
        client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time, current_database() as db_name');
        dbStatus = 'connected';
        dbDetails = {
            current_time: result.rows[0].current_time,
            database_name: result.rows[0].db_name,
            pool_total: pool.totalCount,
            pool_idle: pool.idleCount,
            pool_waiting: pool.waitingCount
        };
    } catch (err) {
        console.error('Database health check failed:', err.message);
        dbDetails = {
            error: err.message,
            code: err.code
        };
    } finally {
        if (client) client.release();
    }

    res.json({ 
        status: 'Server is running', 
        database: dbStatus,
        database_details: dbDetails,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Get all tables in the database
app.get('/api/tables', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const result = await client.query(`
            SELECT table_name, table_schema
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        res.json({
            success: true,
            tables: result.rows,
            count: result.rows.length
        });
    } catch (err) {
        console.error('Error fetching tables:', err.message);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch tables',
            details: err.message,
            code: err.code
        });
    } finally {
        if (client) client.release();
    }
});

// Get data from a specific table with better error handling
app.get('/api/data/:tableName', async (req, res) => {
    let client;
    try {
        const { tableName } = req.params;
        const limit = Math.min(parseInt(req.query.limit) || 100, 1000); // Cap at 1000 records

        client = await pool.connect();

        // Validate table name to prevent SQL injection
        const validTables = await client.query(`
            SELECT table_name, table_schema
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = $1
        `, [tableName]);

        if (validTables.rows.length === 0) {
            return res.status(404).json({ 
                success: false,
                error: 'Table not found',
                table_name: tableName
            });
        }

        // Get table structure
        const columns = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = $1 AND table_schema = 'public'
            ORDER BY ordinal_position;
        `, [tableName]);

        // Get table data with better error handling
        let data;
        try {
            // Try with timestamp ordering first
            data = await client.query(`SELECT * FROM "${tableName}" ORDER BY timestamp DESC LIMIT $1`, [limit]);
        } catch (queryErr) {
            console.log('Timestamp column not found, trying with id ordering...');
            try {
                data = await client.query(`SELECT * FROM "${tableName}" ORDER BY id DESC LIMIT $1`, [limit]);
            } catch (queryErr2) {
                console.log('ID column not found, fetching without ordering...');
                data = await client.query(`SELECT * FROM "${tableName}" LIMIT $1`, [limit]);
            }
        }

        res.json({
            success: true,
            tableName,
            columns: columns.rows,
            data: data.rows,
            totalRows: data.rows.length,
            limit: limit
        });
    } catch (err) {
        console.error('Error fetching data:', err.message);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch data from table',
            details: err.message,
            code: err.code,
            table_name: req.params.tableName
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
        
        // Validate table exists
        const tableExists = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = $1
        `, [tableName]);

        if (tableExists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Table not found',
                table_name: tableName
            });
        }

        const countResult = await client.query(`SELECT COUNT(*) as total FROM "${tableName}"`);

        res.json({
            success: true,
            tableName,
            totalRecords: parseInt(countResult.rows[0].total),
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Error fetching stats:', err.message);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch table statistics',
            details: err.message,
            code: err.code,
            table_name: req.params.tableName
        });
    } finally {
        if (client) client.release();
    }
});

// Test database connectivity endpoint
app.get('/api/test-db', async (req, res) => {
    const connectionTest = await testConnection(1);
    res.json({
        database_reachable: connectionTest,
        timestamp: new Date().toISOString(),
        pool_status: {
            total: pool.totalCount,
            idle: pool.idleCount,
            waiting: pool.waitingCount
        }
    });
});

// Graceful shutdown with better cleanup
const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    try {
        await pool.end();
        console.log('Database pool closed successfully');
    } catch (err) {
        console.error('Error closing database pool:', err.message);
    }
    process.exit(0);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API endpoints available at http://localhost:${port}/api`);
    console.log(`Health check: http://localhost:${port}/api/health`);
    console.log(`Database test: http://localhost:${port}/api/test-db`);
});