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
    // Mask API key: show first 4 and last 4 chars
    if (config.api_key && config.api_key.length > 8) {
      const masked = config.api_key.substring(0, 4) + '***' + config.api_key.substring(config.api_key.length - 4);
      config.api_key = masked;
    }
    res.json({ config });
  } catch (error) {
    console.error('Error fetching AI config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get config for specific model (must be before PUT route)
router.get('/config/model/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const result = await configPool.query(
      'SELECT * FROM ai_config WHERE model_id = $1 AND is_active = true LIMIT 1',
      [modelId]
    );
    if (result.rows.length === 0) {
      return res.json({ config: null });
    }
    const config = result.rows[0];
    // Mask API key: show first 4 and last 4 chars
    if (config.api_key && config.api_key.length > 8) {
      const masked = config.api_key.substring(0, 4) + '***' + config.api_key.substring(config.api_key.length - 4);
      config.api_key = masked;
    }
    res.json({ config });
  } catch (error) {
    console.error('Error fetching AI config:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update AI config (UPSERT: insert if not exists, update if exists)
router.put('/config/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { api_key, api_endpoint, is_default } = req.body;
    
    // Validate modelId
    const validModels = ['claude', 'gpt4', 'gemini', 'local'];
    if (!validModels.includes(modelId)) {
      return res.status(400).json({ error: 'Invalid model_id' });
    }
    
    // Get model info from constants
    const modelInfo = {
      claude: { name: 'Claude (Anthropic)', provider: 'anthropic' },
      gpt4: { name: 'GPT-4o (OpenAI)', provider: 'openai' },
      gemini: { name: 'Gemini Pro (Google)', provider: 'google' },
      local: { name: 'Local LLM (Ollama)', provider: 'ollama' }
    };
    
    const info = modelInfo[modelId];
    
    // Check if config exists
    const checkResult = await configPool.query(
      'SELECT * FROM ai_config WHERE model_id = $1',
      [modelId]
    );
    
    const exists = checkResult.rows.length > 0;
    const existingConfig = exists ? checkResult.rows[0] : null;
    
    // If setting as default, unset others first
    if (is_default) {
      await configPool.query('UPDATE ai_config SET is_default = false WHERE model_id != $1', [modelId]);
    }
    
    let result;
    
    if (exists) {
      // UPDATE existing config
      const updates = [];
      const values = [];
      let paramCount = 1;
      
      // Only update api_key if provided (don't overwrite with empty)
      if (api_key !== undefined && api_key !== null && api_key !== '') {
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
      
      if (updates.length > 1) { // More than just updated_at
        result = await configPool.query(
          `UPDATE ai_config SET ${updates.join(', ')} WHERE model_id = $${paramCount} RETURNING *`,
          values
        );
      } else {
        // No updates needed, just return existing
        result = checkResult;
      }
    } else {
      // INSERT new config
      const insertValues = [modelId, info.name, info.provider];
      const insertFields = ['model_id', 'model_name', 'provider'];
      const placeholders = [];
      let paramCount = 1;
      
      if (api_key !== undefined && api_key !== null && api_key !== '') {
        insertFields.push('api_key');
        insertValues.push(api_key);
        placeholders.push(`$${paramCount++}`);
      } else {
        insertFields.push('api_key');
        insertValues.push('');
        placeholders.push(`$${paramCount++}`);
      }
      
      if (api_endpoint !== undefined) {
        insertFields.push('api_endpoint');
        insertValues.push(api_endpoint);
        placeholders.push(`$${paramCount++}`);
      }
      
      if (is_default !== undefined) {
        insertFields.push('is_default');
        insertValues.push(is_default);
        placeholders.push(`$${paramCount++}`);
      } else {
        insertFields.push('is_default');
        insertValues.push(false);
        placeholders.push(`$${paramCount++}`);
      }
      
      insertFields.push('is_active');
      insertValues.push(true);
      placeholders.push(`$${paramCount++}`);
      
      const fieldsStr = insertFields.join(', ');
      const valuesStr = placeholders.join(', ');
      
      result = await configPool.query(
        `INSERT INTO ai_config (${fieldsStr}) VALUES (${valuesStr}) RETURNING *`,
        insertValues
      );
    }
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Failed to save config' });
    }
    
    const config = result.rows[0];
    // Don't send API key in response for security
    delete config.api_key;
    res.json({ config, message: exists ? 'Config updated' : 'Config created' });
  } catch (error) {
    console.error('Error saving AI config:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as aiRouter };
