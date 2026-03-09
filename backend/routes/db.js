import express from 'express';
import { configPool, createExternalPool } from '../db/pool.js';
import pg from 'pg';
import * as overviewQueries from '../queries/overview.js';
import * as salesQueries from '../queries/sales.js';
import * as customerQueries from '../queries/customer.js';
import * as transactionQueries from '../queries/transaction.js';
import * as locationQueries from '../queries/location.js';

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

// Check health of active external database connection
router.get('/health', async (req, res) => {
  try {
    const result = await configPool.query(
      'SELECT * FROM db_config WHERE is_active = true LIMIT 1'
    );
    if (result.rows.length === 0) {
      return res.json({ connected: false, error: 'No active database configuration' });
    }
    
    const config = result.rows[0];
    const externalPool = createExternalPool(config);
    
    try {
      await externalPool.query('SELECT NOW()');
      await externalPool.end();
      res.json({ connected: true });
    } catch (error) {
      await externalPool.end().catch(() => {});
      res.json({ connected: false, error: error.message });
    }
  } catch (error) {
    res.json({ connected: false, error: error.message });
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

// Lấy pool kết nối đến database BÊN NGOÀI theo cấu hình đã LƯU trong bảng db_config (database config của hệ thống).
// Mọi dữ liệu datamart (overview, customer, transaction) CHỈ lấy từ DB ngoài theo config đã lưu, không dùng config từ "Test kết nối".
const getActiveExternalPool = async () => {
  const result = await configPool.query(
    'SELECT * FROM db_config WHERE is_active = true LIMIT 1'
  );
  if (result.rows.length === 0) {
    throw new Error('Chưa có cấu hình DB active. Vào Cài đặt → Lưu cấu hình để lấy dữ liệu từ database bên ngoài.');
  }
  return createExternalPool(result.rows[0]);
};

// Query datamart_customer table (no id column: use MaTheKHTT)
router.get('/datamart/customer', async (req, res) => {
  try {
    const { limit = 1000, offset = 0, search = '' } = req.query;
    const externalPool = await getActiveExternalPool();
    
    const result = await externalPool.query(customerQueries.getCustomers(limit, offset, search));
    const countResult = await externalPool.query(customerQueries.countCustomers(search));
    
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

// Lịch sử đơn: chỉ query datamart_transaction + datamart_location (không dùng datamart_customer)
// datamart_transaction: MaHD (đơn), MaHH (SKU), TenHH, NgayGioQuet, store_name, SoLuong, DGBan, ThanhTienBan, TienGiamGia, category_name
// datamart_location: item_number, barcode, item_name, location_name, localtion_adress (bổ sung thông tin sản phẩm/vị trí)
router.get('/datamart/transaction', async (req, res) => {
  try {
    const { limit = 100, offset = 0, customerId } = req.query;
    const externalPool = await getActiveExternalPool();
    const limitNum = Math.min(Math.max(parseInt(limit) || 100, 1), 500);
    const offsetNum = Math.max(parseInt(offset) || 0, 0);

    const formatItem = (it) => ({
      sku: it.sku || it.MaHH || '',
      name: it.name || it.TenHH || '',
      price: Number(it.price ?? it.DGBan ?? 0),
      qty: Number(it.qty ?? it.SoLuong ?? 0),
      cat: it.cat ?? it.category_name ?? '',
      amt: Number(it.amt ?? it.ThanhTienBan ?? 0),
      location_name: it.location_name ?? null,
      location_address: it.localtion_adress ?? it.location_address ?? null,
    });

    const formatOrder = (row) => {
      const total = Number(row.total ?? row.final_total ?? row.ThanhTienBan ?? 0);
      const disc = Number(row.disc ?? row.TienGiamGia ?? 0);
      const sub = Number(row.sub ?? row.total ?? total);
      return {
        id: row.id ?? row.MaHD ?? row.mahd ?? '',
        date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
        store: row.store ?? row.store_name ?? '',
        pay: 'Tiền mặt',
        total,
        disc,
        sub,
        pts: Math.round(total / 10000),
        status: 'done',
        items: (row.items ?? []).filter(Boolean).map(formatItem),
      };
    };

    const locationTable = await getLocationTable(externalPool);
    const locJoin = locationTable
      ? `LEFT JOIN public.${locationTable} l ON (t."MaHH" = l.item_number OR t."MaHH" = l.barcode)`
      : '';
    const itemJson = locationTable
      ? `json_build_object('sku',t."MaHH",'name',COALESCE(l.item_name,t."TenHH"),'price',t."DGBan",'qty',t."SoLuong",'cat',t."category_name",'amt',t."ThanhTienBan",'location_name',l.location_name,'location_address',l.localtion_adress)`
      : `json_build_object('sku',t."MaHH",'name',t."TenHH",'price',t."DGBan",'qty',t."SoLuong",'cat',t."category_name",'amt',t."ThanhTienBan")`;

    if (customerId) {
      const custIdStr = String(customerId).trim();
      const txQuery = `
        SELECT 
          t."MaHD" AS "id",
          MAX(t."NgayGioQuet")::date AS "date",
          MAX(t."store_name") AS "store",
          SUM(t."ThanhTienBan") AS "total",
          COALESCE(SUM(t."TienGiamGia"), 0) AS "disc",
          json_agg(${itemJson} ORDER BY t."STT" NULLS LAST, t."MaHH" NULLS LAST) AS "items"
        FROM public.datamart_transaction t
        ${locJoin}
        WHERE t."MaTheKHTT"::text = $1
          AND t."MaHD" IS NOT NULL AND TRIM(COALESCE(t."MaHD",'')) != ''
        GROUP BY t."MaHD"
        ORDER BY MAX(t."NgayGioQuet") DESC NULLS LAST
        LIMIT $2 OFFSET $3
      `;
      const countQuery = `
        SELECT COUNT(DISTINCT "MaHD")
        FROM public.datamart_transaction
        WHERE "MaTheKHTT"::text = $1
          AND "MaHD" IS NOT NULL AND TRIM(COALESCE("MaHD",'')) != ''
      `;
      const [txRes, countRes] = await Promise.all([
        externalPool.query(txQuery, [custIdStr, limitNum, offsetNum]),
        externalPool.query(countQuery, [custIdStr]),
      ]);
      const data = txRes.rows.map(row => formatOrder({
        ...row,
        sub: Number(row.total ?? 0),
      }));
      return res.json({
        data,
        total: parseInt(countRes.rows[0]?.count ?? 0, 10),
        limit: limitNum,
        offset: offsetNum,
      });
    }

    const query = `
      SELECT 
        t."MaHD" AS "id",
        MAX(t."NgayGioQuet")::date AS "date",
        MAX(t."store_name") AS "store",
        MAX(t."MaTheKHTT") AS "customerId",
        SUM(t."ThanhTienBan") AS "total",
        COALESCE(SUM(t."TienGiamGia"), 0) AS "disc",
        json_agg(${itemJson} ORDER BY t."STT" NULLS LAST, t."MaHH" NULLS LAST) AS "items"
      FROM public.datamart_transaction t
      ${locJoin}
      WHERE t."MaHD" IS NOT NULL AND TRIM(COALESCE(t."MaHD",'')) != ''
      GROUP BY t."MaHD"
      ORDER BY MAX(t."NgayGioQuet") DESC NULLS LAST
      LIMIT $1 OFFSET $2
    `;
    const countQuery = `SELECT COUNT(DISTINCT "MaHD") FROM public.datamart_transaction WHERE "MaHD" IS NOT NULL`;
    const [result, countResult] = await Promise.all([
      externalPool.query(query, [limitNum, offsetNum]),
      externalPool.query(countQuery),
    ]);
    const data = result.rows.map(row => formatOrder({
      ...row,
      sub: Number(row.total ?? 0),
    }));
    res.json({
      data,
      total: parseInt(countResult.rows[0]?.count ?? 0, 10),
      limit: limitNum,
      offset: offsetNum,
    });
  } catch (error) {
    console.error('Error querying datamart_transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

let _locTableCache = undefined; // undefined=chưa check, null=không có, string=tên bảng
async function getLocationTable(pool) {
  if (_locTableCache !== undefined) return _locTableCache;
  try {
    const r = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('datamart_location','datamart_localtion') LIMIT 1`);
    _locTableCache = r.rows[0]?.table_name || null;
  } catch {
    _locTableCache = null;
  }
  return _locTableCache;
}

// Endpoint gộp: details + orders + persona trong 1 request (tối ưu, ít round-trip hơn)
router.get('/datamart/customer/:customerId/modal', async (req, res) => {
  try {
    const { customerId } = req.params;
    const custIdStr = String(customerId).trim();
    const externalPool = await getActiveExternalPool();

    const locTable = await getLocationTable(externalPool);
    const locJoin = locTable ? `LEFT JOIN public.${locTable} l ON (t."MaHH"=l.item_number OR t."MaHH"=l.barcode)` : '';
    const itemJson = locTable
      ? `json_build_object('sku',t."MaHH",'name',COALESCE(l.item_name,t."TenHH"),'price',t."DGBan",'qty',t."SoLuong",'cat',t."category_name",'amt',t."ThanhTienBan")`
      : `json_build_object('sku',t."MaHH",'name',t."TenHH",'price',t."DGBan",'qty',t."SoLuong",'cat',t."category_name",'amt',t."ThanhTienBan")`;

    const txQuery = `
      SELECT t."MaHD" AS "id", MAX(t."NgayGioQuet")::date AS "date", MAX(t."store_name") AS "store",
        SUM(t."ThanhTienBan") AS "total", COALESCE(SUM(t."TienGiamGia"),0) AS "disc",
        json_agg(${itemJson} ORDER BY t."STT" NULLS LAST, t."MaHH" NULLS LAST) AS "items"
      FROM public.datamart_transaction t ${locJoin}
      WHERE t."MaTheKHTT"::text=$1 AND t."MaHD" IS NOT NULL AND TRIM(COALESCE(t."MaHD",''))!=''
      GROUP BY t."MaHD" ORDER BY MAX(t."NgayGioQuet") DESC NULLS LAST LIMIT 100
    `;

    const [txRes, configPersona] = await Promise.all([
      externalPool.query(txQuery, [custIdStr]),
      configPool.query(`SELECT value_seg,lifecycle,aov_level,freq_level,product_persona,payment_persona,price_sens,shop_mission,channel,note FROM customer_persona WHERE MaTheKHTT=$1 LIMIT 1`, [custIdStr]).catch(() => ({ rows: [] })),
    ]);

    const orders = (txRes.rows || []).map(row => ({
      id: row.id || row.MaHD || '',
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
      store: row.store || '',
      pay: 'Tiền mặt',
      total: Number(row.total || 0),
      disc: Number(row.disc || 0),
      sub: Number(row.total || 0),
      pts: Math.round(Number(row.total || 0) / 10000),
      status: 'done',
      items: (row.items || []).filter(Boolean).map(it => ({
        sku: it.sku || it.MaHH || '',
        name: it.name || it.TenHH || '',
        price: Number(it.price || it.DGBan || 0),
        qty: Number(it.qty || it.SoLuong || 0),
        cat: it.cat || it.category_name || '',
        amt: Number(it.amt || it.ThanhTienBan || 0),
      })),
    }));

    const catMap = {}, prodMap = {}, storeSet = new Set();
    let grossAmt = 0, discAmt = 0, totalQty = 0, topCat = '';
    for (const o of orders) {
      storeSet.add(o.store);
      grossAmt += o.sub;
      discAmt += o.disc;
      for (const it of (o.items || [])) {
        if (it.cat) { catMap[it.cat] = (catMap[it.cat] || 0) + (it.amt || 0); }
        if (it.name) { prodMap[it.name] = (prodMap[it.name] || 0) + (it.amt || 0); }
        totalQty += Number(it.qty || 0);
      }
    }
    const categories = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n);
    const products = Object.entries(prodMap).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => n);
    const stores = [...storeSet].filter(Boolean).sort();
    topCat = (Object.entries(catMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '').toLowerCase();

    let persona = null;
    if (configPersona.rows?.length > 0) {
      const r = configPersona.rows[0];
      persona = { value_seg: r.value_seg, lifecycle: r.lifecycle, aov_level: r.aov_level, freq_level: r.freq_level, product_persona: Array.isArray(r.product_persona) ? r.product_persona : (r.product_persona ? [r.product_persona] : []), payment_persona: r.payment_persona, price_sens: r.price_sens, shop_mission: r.shop_mission, channel: r.channel, note: r.note };
    } else {
      const custStats = await externalPool.query(`
        SELECT COUNT(DISTINCT "MaHD") AS total_orders, COALESCE(SUM("ThanhTienBan"),0) AS total_spent, MAX("NgayHD") AS last_purchase, MIN("NgayHD") AS first_purchase,
        CASE WHEN MAX("NgayHD") IS NOT NULL AND MIN("NgayHD") IS NOT NULL THEN ROUND(COUNT(DISTINCT "MaHD")::NUMERIC/GREATEST(EXTRACT(EPOCH FROM (MAX("NgayHD")-MIN("NgayHD")))/2592000.0,1),2) ELSE 0 END AS frequency_month
        FROM public.datamart_customer WHERE "MaTheKHTT"::text=$1
      `, [custIdStr]).catch(() => ({ rows: [{}] }));
      const s = custStats.rows[0];
      if (s && Number(s.total_orders || 0) > 0) {
        const totalSpent = Number(s.total_spent || 0);
        const freq = Number(s.frequency_month || 0);
        const lastPurchase = s.last_purchase ? new Date(s.last_purchase) : null;
        const daysSince = lastPurchase ? Math.floor((Date.now() - lastPurchase.getTime()) / 864e5) : 999;
        const rScore = daysSince <= 7 ? 5 : daysSince <= 30 ? 4 : daysSince <= 60 ? 3 : daysSince <= 120 ? 2 : 1;
        const fScore = freq >= 4 ? 5 : freq >= 2.5 ? 4 : freq >= 1.5 ? 3 : freq >= 0.8 ? 2 : 1;
        const mScore = totalSpent >= 50e6 ? 5 : totalSpent >= 20e6 ? 4 : totalSpent >= 10e6 ? 3 : totalSpent >= 5e6 ? 2 : 1;
        const totalRFM = rScore + fScore + mScore;
        const segment = totalRFM >= 13 ? 'Champions' : totalRFM >= 10 ? 'Loyal' : totalRFM >= 7 ? 'Potential' : totalRFM >= 5 ? 'At Risk' : 'Hibernating';
        const valueSeg = segment === 'Champions' ? 'Super VIP' : segment === 'Loyal' ? 'VIP' : segment === 'Potential' ? 'Regular' : 'Low';
        const lifecycle = ['Champions', 'Loyal'].includes(segment) ? 'Loyal' : segment === 'Potential' ? 'Growing' : segment === 'At Risk' ? 'Declining' : 'Churning';
        const avgBasket = totalSpent / Number(s.total_orders || 1);
        const aovLevel = avgBasket >= 500000 ? 'High' : avgBasket >= 300000 ? 'Medium-High' : avgBasket >= 150000 ? 'Medium' : avgBasket >= 50000 ? 'Low-Medium' : 'Low';
        const freqLevel = freq >= 4 ? 'Very High' : freq >= 2.5 ? 'High' : freq >= 1.5 ? 'Medium' : freq >= 0.8 ? 'Low' : 'Very Low';
        const ordersTx = orders.length;
        const avgItemsPerOrder = ordersTx > 0 ? totalQty / ordersTx : 0;
        const discountRatio = grossAmt > 0 ? discAmt / grossAmt : 0;
        const productPersonaTags = topCat.includes('snack') ? ['Office Snacker'] : topCat.includes('đồ uống') || topCat.includes('do uong') ? ['Quick Meal Buyer'] : avgBasket >= 500000 && avgItemsPerOrder >= 5 ? ['Full Basket Shopper'] : avgBasket <= 200000 && avgItemsPerOrder <= 3 ? ['Top-up Shopper'] : ['Grocery Shopper'];
        const priceSens = discountRatio >= 0.15 ? 'Price Sensitive' : discountRatio >= 0.05 ? 'Deal Hunter' : discountRatio <= 0.01 && avgBasket >= 400000 ? 'Quality First' : 'Balanced';
        const shopMission = avgBasket >= 700000 && avgItemsPerOrder >= 6 ? 'Full Basket' : avgBasket >= 400000 && freq <= 1.5 ? 'Weekly Stock-up' : avgBasket <= 200000 && freq >= 2 ? 'Quick Refill' : avgItemsPerOrder <= 2 && avgBasket <= 150000 ? 'Impulse Buy' : 'Need-based';
        persona = { value_seg: valueSeg, lifecycle, aov_level: aovLevel, freq_level: freqLevel, product_persona: productPersonaTags, payment_persona: 'Cash Only', price_sens: priceSens, shop_mission: shopMission, channel: 'In-store Only', note: null };
      }
    }

    res.json({
      details: { categories, products, stores },
      orders: { data: orders, total: orders.length, limit: 100, offset: 0 },
      persona: persona ? { persona } : { persona: null },
    });
  } catch (err) {
    console.error('Error getCustomerModal:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lấy thông tin chi tiết khách hàng (top categories, products, stores)
router.get('/datamart/customer/:customerId/details', async (req, res) => {
  try {
    const { customerId } = req.params;
    const externalPool = await getActiveExternalPool();
    
    const [categories, products, stores] = await Promise.all([
      externalPool.query(customerQueries.getCustomerCategories(customerId)),
      externalPool.query(customerQueries.getCustomerProducts(customerId)),
      externalPool.query(customerQueries.getCustomerStores(customerId))
    ]);
    
    res.json({
      categories: categories.rows.map(r => r.name),
      products: products.rows.map(r => r.name),
      stores: stores.rows.map(r => r.store_name)
    });
  } catch (error) {
    console.error('Error getting customer details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Lấy customer persona từ database cấu hình (menas_dx_config.customer_persona)
router.get('/datamart/customer/:customerId/persona', async (req, res) => {
  try {
    const { customerId } = req.params;
    let result = { rows: [] };

    // 1) Thử lấy persona đã được cấu hình thủ công (bảng có thể chưa tồn tại)
    try {
      result = await configPool.query(
        `SELECT value_seg, lifecycle, aov_level, freq_level, product_persona, payment_persona, price_sens, shop_mission, channel, note
         FROM customer_persona WHERE MaTheKHTT = $1 LIMIT 1`,
        [customerId]
      );
    } catch (_) {
      // customer_persona chưa tạo → bỏ qua
    }

    if (result.rows.length === 0) {
      // 2) Nếu chưa có, auto-generate persona từ RFM / AOV dựa trên datamart_customer
      try {
        const externalPool = await getActiveExternalPool();
        const statsRes = await externalPool.query(
          `
            SELECT
              COUNT(DISTINCT c."MaHD") AS total_orders,
              COALESCE(SUM(c."ThanhTienBan"), 0) AS total_spent,
              MAX(c."NgayHD") AS last_purchase,
              MIN(c."NgayHD") AS first_purchase,
              CASE 
                WHEN MAX(c."NgayHD") IS NOT NULL AND MIN(c."NgayHD") IS NOT NULL
                THEN ROUND(
                  COUNT(DISTINCT c."MaHD")::NUMERIC / 
                  GREATEST(
                    EXTRACT(EPOCH FROM (MAX(c."NgayHD") - MIN(c."NgayHD"))) / 2592000.0,
                    1
                  ),
                  2
                )
                ELSE 0
              END AS frequency_month
            FROM public.datamart_customer c
            WHERE c."MaTheKHTT"::text = $1
          `,
          [customerId]
        );

        let txStatsRes = { rows: [{}] };
        try {
          txStatsRes = await externalPool.query(
            `SELECT COUNT(DISTINCT t."MaHD") AS orders, COALESCE(SUM(t."TriGiaBan"),0) AS gross_amount, COALESCE(SUM(t."TienGiamGia"),0) AS discount_amount,
             COALESCE(SUM(t."SoLuong"),0) AS total_qty, MAX(t."category_name") FILTER (WHERE t."category_name" IS NOT NULL) AS top_category
             FROM public.datamart_transaction t WHERE t."MaTheKHTT"::text = $1`,
            [customerId]
          );
        } catch (_) { /* datamart_transaction có thể chưa tồn tại */ }

        const s = statsRes.rows[0];
        if (!s) {
          return res.json({ persona: null });
        }

        const totalSpent = Number(s.total_spent || 0);
        const freq = Number(s.frequency_month || 0);
        const lastPurchase = s.last_purchase ? new Date(s.last_purchase) : null;
        const daysSince = lastPurchase ? Math.floor((Date.now() - lastPurchase.getTime()) / 864e5) : 999;

        const rScore = daysSince <= 7 ? 5 : daysSince <= 30 ? 4 : daysSince <= 60 ? 3 : daysSince <= 120 ? 2 : 1;
        const fScore = freq >= 4 ? 5 : freq >= 2.5 ? 4 : freq >= 1.5 ? 3 : freq >= 0.8 ? 2 : 1;
        const mScore = totalSpent >= 50e6 ? 5 : totalSpent >= 20e6 ? 4 : totalSpent >= 10e6 ? 3 : totalSpent >= 5e6 ? 2 : 1;
        const totalRFM = rScore + fScore + mScore;

        const segment =
          totalRFM >= 13 ? 'Champions' :
          totalRFM >= 10 ? 'Loyal' :
          totalRFM >= 7 ? 'Potential' :
          totalRFM >= 5 ? 'At Risk' :
          'Hibernating';

        const valueSeg =
          segment === 'Champions' ? 'Super VIP' :
          segment === 'Loyal' ? 'VIP' :
          segment === 'Potential' ? 'Regular' :
          'Low';

        const lifecycle =
          segment === 'Champions' || segment === 'Loyal' ? 'Loyal' :
          segment === 'Potential' ? 'Growing' :
          segment === 'At Risk' ? 'Declining' :
          'Churning';

        const avgBasket = s.total_orders > 0
          ? Number(totalSpent / Number(s.total_orders || 1))
          : 0;

        const aovLevel =
          avgBasket >= 500000 ? 'High' :
          avgBasket >= 300000 ? 'Medium-High' :
          avgBasket >= 150000 ? 'Medium' :
          avgBasket >= 50000 ? 'Low-Medium' :
          'Low';

        const freqLevel =
          freq >= 4 ? 'Very High' :
          freq >= 2.5 ? 'High' :
          freq >= 1.5 ? 'Medium' :
          freq >= 0.8 ? 'Low' :
          'Very Low';

        const tx = txStatsRes.rows[0] || {};
        const ordersTx = Number(tx.orders || 0);
        const grossAmount = Number(tx.gross_amount || 0);
        const discountAmount = Number(tx.discount_amount || 0);
        const totalQty = Number(tx.total_qty || 0);
        const avgItemsPerOrder = ordersTx > 0 ? totalQty / ordersTx : 0;
        const discountRatio = grossAmount > 0 ? discountAmount / grossAmount : 0;
        const topCategory = (tx.top_category || '').toString().toLowerCase();

        // product_persona: suy luận đơn giản dựa trên category + AOV
        const productPersonaTags = [];
        if (topCategory.includes('snack')) {
          productPersonaTags.push('Office Snacker');
        } else if (topCategory.includes('đồ uống') || topCategory.includes('do uong')) {
          productPersonaTags.push('Quick Meal Buyer');
        } else if (avgBasket >= 500000 && avgItemsPerOrder >= 5) {
          productPersonaTags.push('Full Basket Shopper');
        } else if (avgBasket <= 200000 && avgItemsPerOrder <= 3) {
          productPersonaTags.push('Top-up Shopper');
        } else {
          productPersonaTags.push('Grocery Shopper');
        }

        // payment_persona: chưa có cột phương thức thanh toán → giả định tiền mặt
        const paymentPersona = 'Cash Only';

        // price_sens: dựa trên tỉ lệ giảm giá
        const priceSens =
          discountRatio >= 0.15 ? 'Price Sensitive' :
          discountRatio >= 0.05 ? 'Deal Hunter' :
          discountRatio <= 0.01 && avgBasket >= 400000 ? 'Quality First' :
          'Balanced';

        // shopping_mission: dựa trên AOV + items/order + frequency
        let shopMission;
        if (avgBasket >= 700000 && avgItemsPerOrder >= 6) {
          shopMission = 'Full Basket';
        } else if (avgBasket >= 400000 && freq <= 1.5) {
          shopMission = 'Weekly Stock-up';
        } else if (avgBasket <= 200000 && freq >= 2) {
          shopMission = 'Quick Refill';
        } else if (avgItemsPerOrder <= 2 && avgBasket <= 150000) {
          shopMission = 'Impulse Buy';
        } else {
          shopMission = 'Need-based';
        }

        // channel: datamart hiện là offline store → gán mặc định In-store Only
        const channel = 'In-store Only';

        const persona = {
          value_seg: valueSeg,
          lifecycle,
          aov_level: aovLevel,
          freq_level: freqLevel,
          product_persona: productPersonaTags || [],
          payment_persona: paymentPersona,
          price_sens: priceSens,
          shop_mission: shopMission,
          channel,
          note: null,
        };
        try {
          await configPool.query(
            `INSERT INTO customer_persona (MaTheKHTT,value_seg,lifecycle,aov_level,freq_level,product_persona,payment_persona,price_sens,shop_mission,channel,note)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NULL)`,
            [customerId, valueSeg, lifecycle, aovLevel, freqLevel, productPersonaTags, paymentPersona, priceSens, shopMission, channel]
          );
        } catch (_) { /* bảng chưa tồn tại */ }
        return res.json({ persona });
      } catch (e) {
        console.error('Error auto-generating customer persona:', e);
        return res.json({ persona: null });
      }
    }

    const row = result.rows[0];
    res.json({
      persona: {
        value_seg: row.value_seg || null,
        lifecycle: row.lifecycle || null,
        aov_level: row.aov_level || null,
        freq_level: row.freq_level || null,
        product_persona: Array.isArray(row.product_persona) ? row.product_persona : (row.product_persona ? [row.product_persona] : []),
        payment_persona: row.payment_persona || null,
        price_sens: row.price_sens || null,
        shop_mission: row.shop_mission || null,
        channel: row.channel || null,
        note: row.note || null,
      },
    });
  } catch (error) {
    console.error('Error getting customer persona:', error);
    res.status(500).json({ error: error.message });
  }
});

// Query datamart_localtion table (table may not exist)
router.get('/datamart/location', async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const externalPool = await getActiveExternalPool();
    
    const tableExists = await externalPool.query(`
      SELECT EXISTS (SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'datamart_localtion')
    `);
    if (!tableExists.rows[0].exists) {
      return res.json({ data: [], total: 0, limit: parseInt(limit), offset: parseInt(offset) });
    }
    
    const result = await externalPool.query(locationQueries.getLocations(limit, offset));
    const countResult = await externalPool.query(locationQueries.countLocations());
    
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

// Overview: dữ liệu tổng hợp từ DB bên ngoài theo config đã lưu trong db_config
// Dùng tên cột có dấu ngoặc kép vì bảng có thể tạo với tên hoa (MaTheKHTT, ThanhTienBan, ...)
router.get('/datamart/overview', async (req, res) => {
  try {
    const externalPool = await getActiveExternalPool();
    const [custStats, revStats, revByMonth, topStores, topCats, segs] = await Promise.all([
      externalPool.query(overviewQueries.getCustomerStats()),
      externalPool.query(overviewQueries.getRevenueStats()),
      externalPool.query(overviewQueries.getRevenueByMonth()),
      externalPool.query(overviewQueries.getTopStores()),
      externalPool.query(overviewQueries.getTopCategories()),
      externalPool.query(overviewQueries.getSegmentation())
    ]);
    
    const c = custStats.rows[0] || {};
    const r = revStats.rows[0] || {};
    const totalRev = Number(r.total_revenue) || 0;
    const totalOrd = parseInt(r.total_orders) || 0;
    const activeFromTx = parseInt(r.active_count) || 0;
    
    // Fallback: if transaction table is empty, try to get revenue/orders from customer table
    let finalRev = totalRev;
    let finalOrd = totalOrd;
    if (totalRev === 0 && totalOrd === 0 && parseInt(r.rows_count) === 0) {
      const custRevResult = await externalPool.query(overviewQueries.getCustomerRevenueFallback());
      if (custRevResult.rows[0]) {
        finalRev = Number(custRevResult.rows[0].total_revenue) || 0;
        finalOrd = parseInt(custRevResult.rows[0].total_orders) || 0;
      }
    }
    
    const aov = finalOrd > 0 ? Math.round(finalRev / finalOrd) : 0;
    
    // Use active customers from transactions if status-based count is 0 but we have transaction data
    let activeCustomers = parseInt(c.active_customers) || 0;
    if (activeCustomers === 0 && (finalOrd > 0 || activeFromTx > 0)) {
      activeCustomers = activeFromTx;
    }
    // If still 0, use total customers as fallback (assume all are active if no status tracking)
    if (activeCustomers === 0 && parseInt(c.total_customers) > 0) {
      activeCustomers = parseInt(c.total_customers) || 0;
    }
    
    const colors = ['#e0e0e0', '#c8965a', '#5bb8f5', '#8888a0', '#ef5350', '#a78bfa', '#2dd4bf', '#f0c040', '#f472b6', '#6366f1'];
    const segmentation = (segs.rows || []).map((s, i) => ({
      name: s.name,
      value: parseInt(s.value) || 0,
      color: colors[i % colors.length]
    }));
    
    res.json({
      overview: {
        total_customers: parseInt(c.total_customers) || 0,
        active_customers: activeCustomers,
        new_this_month: null,
        avg_order_value: aov,
        total_revenue: finalRev,
        total_orders: finalOrd
      },
      revenueByMonth: (revByMonth.rows || []).map(row => ({
        month: row.month || 'T' + row.m,
        revenue: Math.round(Number(row.revenue) / 1e6),
        orders: parseInt(row.orders) || 0
      })),
      topStores: (topStores.rows || []).map(s => ({
        store_name: s.store_name,
        revenue: Number(s.revenue) || 0,
        orders: parseInt(s.orders) || 0
      })),
      catPerf: (topCats.rows || []).map(cat => ({
        name: cat.name,
        revenue: Number(cat.revenue) || 0,
        orders: parseInt(cat.orders) || 0
      })),
      segmentation
    });
  } catch (error) {
    console.error('Error querying datamart overview:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sales: catPerf, payments, hourly, discount, filters (dateFrom, dateTo, store, category)
router.get('/datamart/sales', async (req, res) => {
  try {
    const externalPool = await getActiveExternalPool();
    const { dateFrom, dateTo, store, category, voucher } = req.query || {};
    const params = {};
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (store) params.store = store;
    if (category) params.category = category;
    if (voucher) params.voucher = voucher;

    let vouchersList = [];
    try {
      const vQ = salesQueries.getVouchersForSales();
      const vRes = await externalPool.query(vQ);
      vouchersList = (vRes.rows || []).map(r => r.voucher_code).filter(Boolean);
    } catch (_) { /* Cột MaVoucher/LoaiVoucher/TenVoucher có thể không tồn tại */ }

    const [catQ, hourlyQ, discQ, rateQ, storesQ, catsQ] = [
      salesQueries.getTopCategories(params),
      salesQueries.getOrdersByHour(params),
      salesQueries.getDiscountSummary(params),
      salesQueries.getDiscountByRate(params),
      salesQueries.getStoresForSales(),
      salesQueries.getCategoriesForSales()
    ];
    const [catPerfResult, hourlyResult, discResult, rateResult, storesResult, categoriesResult] = await Promise.all([
      externalPool.query(catQ),
      externalPool.query(hourlyQ),
      externalPool.query(discQ),
      externalPool.query(rateQ),
      externalPool.query(storesQ),
      externalPool.query(catsQ)
    ]);
    let voucherRows = [];
    try {
      const voucherQ = salesQueries.getDiscountByVoucher(params);
      const voucherResult = await externalPool.query(voucherQ);
      voucherRows = voucherResult.rows || [];
    } catch (_) { /* Cột MaVoucher/LoaiVoucher/TenVoucher có thể không tồn tại */ }
    let paymentsRows = [];
    try {
      const payQ = salesQueries.getPaymentsByMethod(params);
      const payResult = await externalPool.query(payQ);
      paymentsRows = payResult.rows || [];
    } catch (_) {
      // Cột PhuongThucThanhToan có thể không tồn tại
    }

    const hourlyMap = new Map((hourlyResult.rows || []).map(r => [r.h, parseInt(r.orders) || 0]));
    const hourly = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}h`,
      orders: hourlyMap.get(i) ?? 0
    }));
    const discRow = discResult.rows?.[0];
    const totalDiscount = Number(discRow?.total_discount || 0);
    const grossRevenue = Number(discRow?.gross_revenue || 0);

    const discountByRate = (rateResult.rows || []).map(r => ({
      type: r.rate_band || 'N/A',
      amount: Number(r.amount) || 0,
      orders: parseInt(r.orders) || 0
    }));
    const discountByVoucher = voucherRows.map(v => ({
      type: v.voucher_type || 'Không mã',
      amount: Number(v.amount) || 0,
      orders: parseInt(v.orders) || 0
    }));

    res.json({
      catPerf: (catPerfResult.rows || []).map(c => ({
        name: c.name || 'N/A',
        revenue: Number(c.revenue) || 0,
        discount: Number(c.discount) || 0,
        orders: parseInt(c.orders) || 0
      })),
      payments: paymentsRows.map(p => ({
        method: p.method || 'Khác',
        amount: Number(p.amount) || 0,
        count: parseInt(p.count) || 0
      })),
      hourly,
      discount: {
        total: totalDiscount,
        gross_revenue: grossRevenue,
        by_rate: discountByRate,
        by_voucher: discountByVoucher
      },
      stores: (storesResult.rows || []).map(r => r.store_name).filter(Boolean),
      categories: (categoriesResult.rows || []).map(r => r.category_name).filter(Boolean),
      vouchers: vouchersList
    });
  } catch (error) {
    console.error('Error querying datamart sales:', error);
    res.status(500).json({ error: error.message });
  }
});

// Marketing: campaigns (chưa có bảng nguồn – trả về rỗng; frontend dùng demo)
router.get('/datamart/marketing', (_req, res) => {
  res.json({
    metrics: { campaigns: 0, reach: '0', ctr: '0%' },
    campaigns: []
  });
});

// Predictions: forecast data (tạm thời trả về demo data, sẽ tích hợp ML model sau)
router.get('/datamart/predictions', async (req, res) => {
  try {
    const { period = '1m' } = req.query;
    const periodMap = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 };
    const months = periodMap[period] || 1;

    // Tạm thời trả về demo data
    // TODO: Tích hợp ML model để tính toán dự báo thực tế từ historical data
    const monthsArr = ["T6", "T7", "T8", "T9", "T10", "T11", "T12", "T1", "T2", "T3", "T4", "T5"];
    const baseRevs = [7.8, 8.1, 7.5, 8.3, 8.8, 9.5, 10.2, 12.5, 7.2, 8.0, 8.4, 8.9];
    const forecast = [];

    for (let i = 0; i < Math.min(months, 12); i++) {
      const rev = baseRevs[i % 12] * (0.95 + Math.random() * 0.1);
      forecast.push({
        month: monthsArr[i % 12],
        revenue: rev * 1e9,
        prevRevenue: baseRevs[i % 12] * 0.88 * 1e9,
        orders: Math.round(rev * 380 + Math.random() * 200),
        newCustomers: Math.round(420 + Math.random() * 180),
        churnRisk: Math.round(280 + Math.random() * 80),
      });
    }

    const totalRevenue = forecast.reduce((s, f) => s + f.revenue, 0);
    const totalOrders = forecast.reduce((s, f) => s + f.orders, 0);
    const totalNewCustomers = forecast.reduce((s, f) => s + f.newCustomers, 0);
    const totalChurnRisk = forecast.reduce((s, f) => s + f.churnRisk, 0);

    res.json({
      forecast,
      totalRevenue,
      totalOrders,
      totalNewCustomers,
      totalChurnRisk,
      events: [],
      insights: [],
    });
  } catch (error) {
    console.error('Error querying predictions:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as dbRouter };
