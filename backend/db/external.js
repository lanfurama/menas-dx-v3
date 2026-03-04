import { configPool, createExternalPool } from './pool.js';

// Helper để lấy pool cho external database từ config trong db_config table
export const getExternalPool = async () => {
  try {
    const result = await configPool.query(
      'SELECT * FROM db_config WHERE is_active = true LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      throw new Error('No active database config found');
    }
    
    const dbConfig = result.rows[0];
    return createExternalPool(dbConfig);
  } catch (error) {
    console.error('Error getting external pool:', error);
    throw error;
  }
};

// Helper để query external database
export const queryExternal = async (query, params = []) => {
  const pool = await getExternalPool();
  try {
    const result = await pool.query(query, params);
    return result;
  } finally {
    // Don't close pool, reuse it
  }
};
