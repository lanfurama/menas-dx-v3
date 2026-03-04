import express from 'express';
import { configPool } from '../db/pool.js';

const router = express.Router();

// Get all AI configs (từ table ai_config trong menas_dx_config database)
router.get('/configs', async (req, res) => {
  try {
    const result = await configPool.query(
      'SELECT id, model_id, model_name, provider, is_default, is_active FROM ai_config ORDER BY is_default DESC'
    );
    res.json({ configs: result.rows });
  } catch (error) {
    console.error('Error fetching AI configs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get default AI config
router.get('/config', async (req, res) => {
  try {
    const result = await configPool.query(
      'SELECT * FROM ai_config WHERE is_default = true AND is_active = true LIMIT 1'
    );
    if (result.rows.length === 0) {
      return res.json({ config: null });
    }
    const config = result.rows[0];
    // Don't send API key in response
    delete config.api_key;
    res.json({ config });
  } catch (error) {
    console.error('Error fetching AI config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update AI config
router.put('/config/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { api_key, api_endpoint, is_default } = req.body;
    
    // If setting as default, unset others
    if (is_default) {
      await configPool.query('UPDATE ai_config SET is_default = false');
    }
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (api_key !== undefined) {
      updates.push(`api_key = $${paramCount++}`);
      values.push(api_key);
    }
    if (api_endpoint !== undefined) {
      updates.push(`api_endpoint = $${paramCount++}`);
      values.push(api_endpoint);
    }
    if (is_default !== undefined) {
      updates.push(`is_default = $${paramCount++}`);
      values.push(is_default);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(modelId);
    
    const result = await configPool.query(
      `UPDATE ai_config SET ${updates.join(', ')} WHERE model_id = $${paramCount} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    const config = result.rows[0];
    delete config.api_key;
    res.json({ config, message: 'Config updated' });
  } catch (error) {
    console.error('Error updating AI config:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as aiRouter };
