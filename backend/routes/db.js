import express from 'express';
import { configPool, createExternalPool } from '../db/pool.js';
import pg from 'pg';

const router = express.Router();

// Get active DB config (từ table db_config trong menas_dx_config database)
router.get('/config', async (req, res) => {
  try {
    const result = await configPool.query(
      'SELECT * FROM db_config WHERE is_active = true LIMIT 1'
    );
    if (result.rows.length === 0) {
      return res.json({ config: null });
    }
    const config = result.rows[0];
    // Don't send password
    delete config.password;
    res.json({ config });
  } catch (error) {
    console.error('[DB Config] Error fetching DB config:', error.message);
    console.error('[DB Config] Error code:', error.code);
    const errorMessage = error.code === 'ECONNREFUSED' || error.message.includes('terminated')
      ? 'Không thể kết nối đến database. Vui lòng kiểm tra cấu hình trong file .env'
      : error.message;
    res.status(500).json({ error: errorMessage });
  }
});

// Save DB config (lưu vào table db_config trong menas_dx_config database)
router.post('/config', async (req, res) => {
  try {
    console.log('[DB Config] POST /config - Received:', {
      name: req.body.name,
      host: req.body.host,
      port: req.body.port,
      database: req.body.database,
      username: req.body.username,
      ssl: req.body.ssl,
      password: req.body.password ? '***' : 'not provided'
    });
    
    const { name, host, port, database, username, password, ssl } = req.body;
    
    if (!host || !database) {
      return res.status(400).json({ error: 'Host và Database là bắt buộc' });
    }
    
    // Ensure password is always a string
    const passwordStr = password !== undefined && password !== null ? String(password) : '';
    
    // Deactivate all other configs
    await configPool.query('UPDATE db_config SET is_active = false');
    
    // Check if config with this name exists
    const existing = await configPool.query(
      'SELECT id, password as old_password FROM db_config WHERE name = $1',
      [name || 'default']
    );
    
    if (existing.rows.length > 0) {
      // Update existing - if password is empty, keep old password
      const finalPassword = passwordStr || existing.rows[0].old_password || '';
      
      const result = await configPool.query(
        `UPDATE db_config 
         SET host = $1, port = $2, database = $3, username = $4, password = $5, ssl = $6, 
             is_active = true, updated_at = CURRENT_TIMESTAMP
         WHERE name = $7
         RETURNING *`,
        [host, port, database, username, finalPassword, ssl || false, name || 'default']
      );
      const config = result.rows[0];
      delete config.password;
      console.log('[DB Config] Config updated successfully');
      res.json({ config, message: 'Config updated' });
    } else {
      // Insert new - password can be empty string but must be string
      const result = await configPool.query(
        `INSERT INTO db_config (name, host, port, database, username, password, ssl, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING *`,
        [name || 'default', host, port, database, username, passwordStr, ssl || false]
      );
      const config = result.rows[0];
      delete config.password;
      console.log('[DB Config] Config saved successfully');
      res.json({ config, message: 'Config saved' });
    }
  } catch (error) {
    console.error('[DB Config] Error saving DB config:', error);
    console.error('[DB Config] Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Lỗi khi lưu cấu hình' });
  }
});

// Helper function to generate CREATE TABLE SQL from schema
const generateCreateTableSQL = async (pool, tableName) => {
  try {
    // Get table columns
    const columnsQuery = await pool.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        numeric_precision,
        numeric_scale,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);

    if (columnsQuery.rows.length === 0) {
      return `-- Table ${tableName} not found\n`;
    }

    // Get primary key
    const pkQuery = await pool.query(`
      SELECT a.attname
      FROM pg_index i
      JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indrelid = 'public.${tableName}'::regclass AND i.indisprimary
    `);

    const primaryKeys = pkQuery.rows.map(r => r.attname);

    // Build CREATE TABLE statement
    let sql = `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;
    const columnDefs = columnsQuery.rows.map(col => {
      let def = `  ${col.column_name} `;
      
      // Data type
      if (col.data_type === 'character varying' || col.data_type === 'varchar') {
        def += `VARCHAR(${col.character_maximum_length || 255})`;
      } else if (col.data_type === 'character' || col.data_type === 'char') {
        def += `CHAR(${col.character_maximum_length || 1})`;
      } else if (col.data_type === 'numeric' || col.data_type === 'decimal') {
        if (col.numeric_precision && col.numeric_scale) {
          def += `NUMERIC(${col.numeric_precision},${col.numeric_scale})`;
        } else {
          def += 'NUMERIC';
        }
      } else if (col.data_type === 'integer') {
        def += 'INTEGER';
      } else if (col.data_type === 'bigint') {
        def += 'BIGINT';
      } else if (col.data_type === 'smallint') {
        def += 'SMALLINT';
      } else if (col.data_type === 'real') {
        def += 'REAL';
      } else if (col.data_type === 'double precision') {
        def += 'DOUBLE PRECISION';
      } else if (col.data_type === 'boolean') {
        def += 'BOOLEAN';
      } else if (col.data_type === 'date') {
        def += 'DATE';
      } else if (col.data_type === 'timestamp without time zone') {
        def += 'TIMESTAMP';
      } else if (col.data_type === 'timestamp with time zone') {
        def += 'TIMESTAMPTZ';
      } else if (col.data_type === 'time without time zone') {
        def += 'TIME';
      } else if (col.data_type === 'text') {
        def += 'TEXT';
      } else {
        def += col.data_type.toUpperCase();
      }

      // NOT NULL
      if (col.is_nullable === 'NO') {
        def += ' NOT NULL';
      }

      // DEFAULT
      if (col.column_default) {
        def += ` DEFAULT ${col.column_default}`;
      }

      return def;
    });

    sql += columnDefs.join(',\n');

    // Add primary key constraint
    if (primaryKeys.length > 0) {
      sql += `,\n  PRIMARY KEY (${primaryKeys.join(', ')})`;
    }

    sql += '\n);\n';

    // Get indexes
    const indexesQuery = await pool.query(`
      SELECT
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = $1
      AND indexname NOT LIKE '%_pkey'
    `, [tableName]);

    if (indexesQuery.rows.length > 0) {
      sql += '\n';
      indexesQuery.rows.forEach(idx => {
        sql += `${idx.indexdef};\n`;
      });
    }

    return sql;
  } catch (error) {
    return `-- Error generating schema for ${tableName}: ${error.message}\n`;
  }
};

// Test DB connection (test kết nối đến database bên ngoài)
router.post('/test', async (req, res) => {
  let testPool = null;
  try {
    const { host, port, database, username, password, ssl } = req.body;
    
    testPool = new pg.Pool({
      host,
      port: parseInt(port),
      database,
      user: username,
      password,
      ssl: ssl ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 5000,
    });
    
    await testPool.query('SELECT NOW()');
    
    // Query schema của 3 bảng datamart
    const tables = ['datamart_customer', 'datamart_transaction', 'datamart_localtion'];
    const schemas = {};
    
    for (const tableName of tables) {
      try {
        // Check if table exists
        const tableExists = await testPool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = $1
          )
        `, [tableName]);
        
        if (tableExists.rows[0].exists) {
          schemas[tableName] = await generateCreateTableSQL(testPool, tableName);
        } else {
          schemas[tableName] = `-- Table ${tableName} does not exist\n`;
        }
      } catch (error) {
        schemas[tableName] = `-- Error querying ${tableName}: ${error.message}\n`;
      }
    }
    
    await testPool.end();
    
    res.json({ 
      success: true, 
      message: 'Connection successful',
      schemas: schemas
    });
  } catch (error) {
    if (testPool) {
      await testPool.end().catch(() => {});
    }
    console.error('Connection test failed:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Connection failed' 
    });
  }
});

// Helper function to get active external pool
const getActiveExternalPool = async () => {
  const result = await configPool.query(
    'SELECT * FROM db_config WHERE is_active = true LIMIT 1'
  );
  if (result.rows.length === 0) {
    throw new Error('No active database configuration found');
  }
  return createExternalPool(result.rows[0]);
};

// Query datamart_customer table
router.get('/datamart/customer', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const externalPool = await getActiveExternalPool();
    
    const result = await externalPool.query(
      `SELECT * FROM public.datamart_customer 
       ORDER BY id 
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );
    
    const countResult = await externalPool.query(
      'SELECT COUNT(*) FROM public.datamart_customer'
    );
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error querying datamart_customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Query datamart_transaction table
router.get('/datamart/transaction', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const externalPool = await getActiveExternalPool();
    
    const result = await externalPool.query(
      `SELECT * FROM public.datamart_transaction 
       ORDER BY id 
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );
    
    const countResult = await externalPool.query(
      'SELECT COUNT(*) FROM public.datamart_transaction'
    );
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error querying datamart_transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

// Query datamart_localtion table
router.get('/datamart/location', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const externalPool = await getActiveExternalPool();
    
    const result = await externalPool.query(
      `SELECT * FROM public.datamart_localtion 
       ORDER BY id 
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );
    
    const countResult = await externalPool.query(
      'SELECT COUNT(*) FROM public.datamart_localtion'
    );
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error querying datamart_localtion:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as dbRouter };
