import { useState, useEffect } from 'react';
import { dbApi } from '../services/api.js';

export function useDbConfig() {
  const [dbCfg, setDbCfg] = useState({ name: 'default', host: '', port: '5432', database: '', username: '', password: '', ssl: false });
  const [dbOn, setDbOn] = useState(false);
  const [dbTest, setDbTest] = useState(false);
  const [dbError, setDbError] = useState('');
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    loadDbConfig();
  }, []);

  const loadDbConfig = async () => {
    try {
      setDbLoading(true);
      const { config } = await dbApi.getConfig();
      if (config) {
        setDbCfg({
          name: config.name || 'default',
          host: config.host || '',
          port: config.port || '5432',
          database: config.database || '',
          username: config.username || '',
          password: '', // Don't load password
          ssl: config.ssl || false,
        });
        if (config.is_active) {
          // Check actual connection health
          try {
            const health = await dbApi.checkHealth();
            setDbOn(health.connected === true);
          } catch {
            setDbOn(false);
          }
        } else {
          setDbOn(false);
        }
      }
    } catch (error) {
      console.error('Failed to load DB config:', error);
      setDbOn(false);
    } finally {
      setDbLoading(false);
    }
  };

  const handleTestDb = async () => {
    try {
      setDbTest(true);
      setDbError('');
      const response = await dbApi.testConnection({
        host: dbCfg.host,
        port: dbCfg.port,
        database: dbCfg.database,
        username: dbCfg.username,
        password: dbCfg.password,
        ssl: dbCfg.ssl,
      });
      
      if (response.success && response.schemas) {
        // Download 3 file SQL
        const tableNames = {
          'datamart_customer': 'datamart_customer.sql',
          'datamart_transaction': 'datamart_transaction.sql',
          'datamart_localtion': 'datamart_localtion.sql'
        };
        
        Object.entries(response.schemas).forEach(([tableName, sql]) => {
          const filename = tableNames[tableName] || `${tableName}.sql`;
          downloadSQLFile(filename, sql);
        });
        
        setDbError('');
        alert('Kết nối thành công! Đã tải xuống 3 file SQL cấu trúc bảng.');
      } else {
        setDbError('');
      }
    } catch (error) {
      setDbError(error.message || 'Kết nối thất bại');
    } finally {
      setDbTest(false);
    }
  };

  const handleSaveDb = async (onDbConnect, addLog) => {
    try {
      setDbLoading(true);
      setDbError('');
      await dbApi.saveConfig(dbCfg);
      // Check actual connection health after saving
      try {
        const health = await dbApi.checkHealth();
        setDbOn(health.connected === true);
      } catch {
        setDbOn(false);
      }
      onDbConnect?.();
      addLog?.('save', 'settings', 'Lưu cấu hình database');
      alert('Đã lưu cấu hình database');
      return true;
    } catch (error) {
      setDbError(error.message || 'Lưu thất bại');
      setDbOn(false);
      return false;
    } finally {
      setDbLoading(false);
    }
  };

  const downloadSQLFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    dbCfg,
    setDbCfg,
    dbOn,
    dbTest,
    dbError,
    dbLoading,
    handleTestDb,
    handleSaveDb,
    loadDbConfig
  };
}
