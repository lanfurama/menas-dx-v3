import express from 'express';
import { configPool } from '../db/pool.js';

const router = express.Router();

// Get Zalo config (từ table zalo_config trong menas_dx_config database)
router.get('/config', async (req, res) => {
  try {
    const result = await configPool.query(
      'SELECT * FROM zalo_config WHERE is_active = true LIMIT 1'
    );
    if (result.rows.length === 0) {
      return res.json({ config: null });
    }
    const config = result.rows[0];
    // Don't send secret_key
    delete config.secret_key;
    res.json({ config });
  } catch (error) {
    console.error('Error fetching Zalo config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Zalo templates
router.get('/templates', async (req, res) => {
  try {
    const result = await configPool.query(
      'SELECT * FROM zalo_templates ORDER BY created_at DESC'
    );
    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as zaloRouter };
