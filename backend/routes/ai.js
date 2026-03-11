import express from 'express';
import { configPool } from '../db/pool.js';

const router = express.Router();

// Get all AI configs (từ table ai_config trong menas_dx_config database)
router.get('/configs', async (req, res) => {
  try {
    const result = await configPool.query(
      `SELECT id, model_id, model_name, provider, is_default, is_active
       FROM ai_config
       WHERE is_active = true
         AND api_key IS NOT NULL
         AND api_key <> ''
       ORDER BY is_default DESC`
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

// Test AI connection
router.post('/test', async (req, res) => {
  try {
    const { modelId, apiKey, apiEndpoint } = req.body;
    
    if (!modelId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Model ID là bắt buộc' 
      });
    }

    // Get actual API key from database if not provided or masked
    let actualApiKey = apiKey;
    if (!actualApiKey || actualApiKey.includes('***')) {
      const result = await configPool.query(
        'SELECT api_key FROM ai_config WHERE model_id = $1 AND is_active = true LIMIT 1',
        [modelId]
      );
      if (result.rows.length > 0 && result.rows[0].api_key) {
        actualApiKey = result.rows[0].api_key;
      }
    }

    if (!actualApiKey || actualApiKey.includes('***')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Vui lòng nhập API key để test' 
      });
    }

    // Get endpoint from database if not provided (for local model)
    let actualEndpoint = apiEndpoint;
    if (!actualEndpoint && modelId === 'local') {
      const result = await configPool.query(
        'SELECT api_endpoint FROM ai_config WHERE model_id = $1 AND is_active = true LIMIT 1',
        [modelId]
      );
      if (result.rows.length > 0 && result.rows[0].api_endpoint) {
        actualEndpoint = result.rows[0].api_endpoint;
      }
      if (!actualEndpoint) {
        actualEndpoint = 'http://localhost:11434';
      }
    }

    let testResult;
    
    switch (modelId) {
      case 'gemini': {
        // Test Google Gemini API (lower tier model)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${actualApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: 'test' }]
            }]
          })
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        testResult = await response.json();
        break;
      }
      
      case 'claude': {
        // Test Anthropic Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': actualApiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        testResult = await response.json();
        break;
      }
      
      case 'gpt4': {
        // Test OpenAI GPT-4 API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${actualApiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'test' }],
            max_tokens: 10
          })
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        testResult = await response.json();
        break;
      }
      
      case 'local': {
        // Test Ollama local endpoint
        const endpoint = actualEndpoint || 'http://localhost:11434';
        const response = await fetch(`${endpoint}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3',
            prompt: 'test',
            stream: false
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        testResult = await response.json();
        break;
      }
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Model không được hỗ trợ' 
        });
    }
    
    res.json({ 
      success: true, 
      message: 'Kết nối thành công!' 
    });
  } catch (error) {
    console.error('AI connection test failed:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Kết nối thất bại' 
    });
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
      gemini: { name: 'Gemini Flash (Google)', provider: 'google' },
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

// AI Predictions endpoint
router.post('/predictions', async (req, res) => {
  try {
    const { period = '1m', internalData, events, weather, market } = req.body;
    
    // Get default AI config from database
    const configResult = await configPool.query(
      'SELECT * FROM ai_config WHERE is_default = true AND is_active = true LIMIT 1'
    );
    
    if (configResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chưa cấu hình AI model mặc định' 
      });
    }
    
    const aiConfig = configResult.rows[0];
    const { model_id, api_key, api_endpoint } = aiConfig;
    
    if (!api_key || api_key.includes('***')) {
      return res.status(400).json({ 
        success: false, 
        error: 'API key chưa được cấu hình' 
      });
    }

    const periodMap = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 };
    const months = periodMap[period] || 1;
    
    // Build prompt for AI
    const prompt = `Bạn là chuyên gia phân tích dữ liệu bán lẻ. Hãy phân tích và dự báo doanh thu cho ${months} tháng tới dựa trên:

DỮ LIỆU NỘI BỘ:
${JSON.stringify(internalData || {}, null, 2)}

SỰ KIỆN & LỄ TẾT:
${JSON.stringify(events || [], null, 2)}

DỰ BÁO THỜI TIẾT:
${JSON.stringify(weather || [], null, 2)}

TIN THỊ TRƯỜNG:
${JSON.stringify(market || [], null, 2)}

Hãy trả về JSON với format:
{
  "forecast": [
    {
      "month": "T7",
      "revenue": 8500000000,
      "prevRevenue": 7800000000,
      "orders": 3200,
      "newCustomers": 450,
      "churnRisk": 280
    }
  ],
  "totalRevenue": 85000000000,
  "totalOrders": 32000,
  "totalNewCustomers": 4500,
  "totalChurnRisk": 2800,
  "insights": [
    {
      "type": "danger",
      "title": "2800 KH churn risk trong 3 tháng",
      "description": "Gửi ZNS win-back + offer cá nhân hoá."
    }
  ]
}

Chỉ trả về JSON, không có text khác.`;

    let aiResponse;
    let aiResult;

    // Call AI API based on model
    switch (model_id) {
      case 'gemini': {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${api_key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        aiResponse = await response.json();
        const text = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Không thể parse kết quả từ AI');
        }
        break;
      }
      
      case 'claude': {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        aiResponse = await response.json();
        const text = aiResponse.content?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Không thể parse kết quả từ AI');
        }
        break;
      }
      
      case 'gpt4': {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 4000,
            response_format: { type: 'json_object' }
          })
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        aiResponse = await response.json();
        const text = aiResponse.choices?.[0]?.message?.content || '';
        aiResult = JSON.parse(text);
        break;
      }
      
      case 'local': {
        const endpoint = api_endpoint || 'http://localhost:11434';
        const response = await fetch(`${endpoint}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3',
            prompt: prompt,
            stream: false,
            options: {
              temperature: 0.7,
              num_predict: 4000
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        aiResponse = await response.json();
        const text = aiResponse.response || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Không thể parse kết quả từ AI');
        }
        break;
      }
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Model không được hỗ trợ' 
        });
    }

    // Transform insights format
    const insights = (aiResult.insights || []).map(ins => {
      const typeMap = { danger: 'danger', warning: 'warning', info: 'info', success: 'success', purple: 'purple' };
      return {
        c: typeMap[ins.type] || 'info',
        t: ins.title || '',
        d: ins.description || '',
        ic2: 'alert'
      };
    });

    res.json({
      success: true,
      forecast: aiResult.forecast || [],
      totalRevenue: aiResult.totalRevenue || 0,
      totalOrders: aiResult.totalOrders || 0,
      totalNewCustomers: aiResult.totalNewCustomers || 0,
      totalChurnRisk: aiResult.totalChurnRisk || 0,
      events: events || [],
      insights: insights
    });
  } catch (error) {
    console.error('AI predictions error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi khi chạy AI predictions' 
    });
  }
});

// AI Customer Analysis endpoint
router.post('/customer-analysis', async (req, res) => {
  try {
    const { phone, customerData } = req.body;
    
    if (!phone && !customerData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone hoặc customerData là bắt buộc' 
      });
    }
    
    // Get default AI config from database
    const configResult = await configPool.query(
      'SELECT * FROM ai_config WHERE is_default = true AND is_active = true LIMIT 1'
    );
    
    if (configResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chưa cấu hình AI model mặc định' 
      });
    }
    
    const aiConfig = configResult.rows[0];
    const { model_id, api_key, api_endpoint } = aiConfig;
    
    if (!api_key || api_key.includes('***')) {
      return res.status(400).json({ 
        success: false, 
        error: 'API key chưa được cấu hình' 
      });
    }
    
    // Build prompt for AI analysis
    const prompt = `Bạn là chuyên gia phân tích khách hàng cho siêu thị bán lẻ. Hãy phân tích dữ liệu khách hàng sau và đưa ra insights chi tiết:

DỮ LIỆU KHÁCH HÀNG:
${JSON.stringify(customerData || {}, null, 2)}

Hãy phân tích và trả về JSON với format sau:
{
  "summary": "Tóm tắt ngắn gọn về khách hàng (2-3 câu)",
  "insights": [
    {
      "type": "opportunity|risk|strength|warning",
      "title": "Tiêu đề insight",
      "description": "Mô tả chi tiết insight này"
    }
  ],
  "recommendations": [
    "Đề xuất hành động cụ thể 1",
    "Đề xuất hành động cụ thể 2"
  ],
  "next_actions": [
    "Hành động tiếp theo 1",
    "Hành động tiếp theo 2"
  ],
  "personalized_recommendations": {
    "frequently_bought": [
      {
        "product": "Tên sản phẩm",
        "reason": "Lý do gợi ý",
        "last_purchase": "Ngày mua cuối"
      }
    ],
    "today_suggestions": [
      {
        "product": "Tên sản phẩm",
        "reason": "Lý do gợi ý dựa trên thời gian/ngày/thời tiết",
        "context": "Bối cảnh (ví dụ: thời tiết nóng, cuối tuần, etc.)"
      }
    ],
    "cross_sell": [
      {
        "product": "Tên sản phẩm",
        "reason": "Lý do cross-sell dựa trên giỏ hàng hiện tại",
        "complementary_to": "Sản phẩm bổ sung"
      }
    ]
  },
  "ai_promotions": [
    {
      "type": "cycle_based|churn_prevention|segment_based|new_customer",
      "title": "Tiêu đề khuyến mãi",
      "description": "Mô tả khuyến mãi",
      "trigger": "Điều kiện kích hoạt",
      "suggested_offer": "Đề xuất offer (ví dụ: Voucher 10% sữa TH)",
      "channel": "SMS|Zalo|Email"
    }
  ],
  "churn_prevention": {
    "risk_level": "low|medium|high",
    "risk_factors": [
      "Yếu tố rủi ro 1",
      "Yếu tố rủi ro 2"
    ],
    "prevention_strategy": [
      "Chiến lược ngăn chặn 1",
      "Chiến lược ngăn chặn 2"
    ],
    "next_purchase_prediction": {
      "predicted_date": "YYYY-MM-DD",
      "confidence": "high|medium|low",
      "suggested_products": ["Sản phẩm 1", "Sản phẩm 2"]
    }
  }
}

Lưu ý:
- Phân tích dựa trên purchase history, top products/categories, behavior patterns, persona
- Xác định opportunities (cross-sell, up-sell), risks (churn), strengths
- Đề xuất cụ thể và có thể thực hiện được
- Personalized recommendations: Dựa trên lịch sử mua hàng, top products, behavior patterns
- AI promotions: Phân tích chu kỳ mua, churn risk, phân khúc để đề xuất khuyến mãi phù hợp
- Churn prevention: Đánh giá risk level, yếu tố rủi ro, và chiến lược ngăn chặn
- Chỉ trả về JSON, không có text khác.`;

    let aiResponse;
    let aiResult;

    // Call AI API based on model
    switch (model_id) {
      case 'gemini': {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${api_key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        aiResponse = await response.json();
        const text = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Không thể parse kết quả từ AI');
        }
        break;
      }
      
      case 'claude': {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        aiResponse = await response.json();
        const text = aiResponse.content?.[0]?.text || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Không thể parse kết quả từ AI');
        }
        break;
      }
      
      case 'gpt4': {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 4000,
            response_format: { type: 'json_object' }
          })
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        aiResponse = await response.json();
        const text = aiResponse.choices?.[0]?.message?.content || '';
        aiResult = JSON.parse(text);
        break;
      }
      
      case 'local': {
        const endpoint = api_endpoint || 'http://localhost:11434';
        const response = await fetch(`${endpoint}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3',
            prompt: prompt,
            stream: false,
            options: {
              temperature: 0.7,
              num_predict: 4000
            }
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        aiResponse = await response.json();
        const text = aiResponse.response || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Không thể parse kết quả từ AI');
        }
        break;
      }
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Model không được hỗ trợ' 
        });
    }

    // Ensure response has required structure
    const analysis = {
      summary: aiResult.summary || 'Không có tóm tắt',
      insights: Array.isArray(aiResult.insights) ? aiResult.insights : [],
      recommendations: Array.isArray(aiResult.recommendations) ? aiResult.recommendations : [],
      next_actions: Array.isArray(aiResult.next_actions) ? aiResult.next_actions : [],
      personalized_recommendations: aiResult.personalized_recommendations || {
        frequently_bought: [],
        today_suggestions: [],
        cross_sell: []
      },
      ai_promotions: Array.isArray(aiResult.ai_promotions) ? aiResult.ai_promotions : [],
      churn_prevention: aiResult.churn_prevention || {
        risk_level: 'low',
        risk_factors: [],
        prevention_strategy: [],
        next_purchase_prediction: null
      }
    };

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('AI customer analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi khi phân tích khách hàng bằng AI' 
    });
  }
});

// AI Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { modelId, messages, systemPrompt } = req.body;
    
    if (!modelId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Model ID là bắt buộc' 
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Messages là bắt buộc và phải là array' 
      });
    }

    // Get AI config from database
    const configResult = await configPool.query(
      'SELECT * FROM ai_config WHERE model_id = $1 AND is_active = true LIMIT 1',
      [modelId]
    );
    
    if (configResult.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Chưa cấu hình AI model: ${modelId}` 
      });
    }
    
    const aiConfig = configResult.rows[0];
    const { api_key, api_endpoint } = aiConfig;
    
    if (!api_key || api_key.includes('***')) {
      return res.status(400).json({ 
        success: false, 
        error: 'API key chưa được cấu hình' 
      });
    }

    let aiResponse;
    let aiText;

    // Call AI API based on model
    switch (modelId) {
      case 'claude': {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': api_key,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            system: systemPrompt || 'Bạn là AI Assistant cho MENAS DX - hệ thống Customer 360° Intelligence Platform.',
            messages: messages.map(m => ({
              role: m.role,
              content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
            }))
          })
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        aiResponse = await response.json();
        aiText = aiResponse.content?.map(b => b.text || '').join('\n') || 'Xin lỗi, không thể tạo phản hồi.';
        break;
      }
      
      case 'gpt4': {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api_key}`
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemPrompt || 'Bạn là AI Assistant cho MENAS DX.' },
              ...messages.map(m => ({
                role: m.role,
                content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
              }))
            ],
            max_tokens: 2000
          })
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        aiResponse = await response.json();
        aiText = aiResponse.choices?.[0]?.message?.content || 'Xin lỗi, không thể tạo phản hồi.';
        break;
      }
      
      case 'gemini': {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${api_key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: (systemPrompt || '') + '\n\n' + messages.map(m => `${m.role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n') }] }
            ]
          })
        });
        
        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: { message: response.statusText } }));
          throw new Error(error.error?.message || `HTTP ${response.status}`);
        }
        
        aiResponse = await response.json();
        aiText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi, không thể tạo phản hồi.';
        break;
      }
      
      case 'local': {
        const endpoint = api_endpoint || 'http://localhost:11434/api/generate';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama3',
            prompt: (systemPrompt || '') + '\n\n' + messages.map(m => `${m.role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n'),
            stream: false
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        aiResponse = await response.json();
        aiText = aiResponse.response || 'Xin lỗi, không thể tạo phản hồi.';
        break;
      }
      
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Model không được hỗ trợ' 
        });
    }
    
    res.json({
      success: true,
      text: aiText,
      model: modelId
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Lỗi khi gửi tin nhắn đến AI' 
    });
  }
});

export { router as aiRouter };
