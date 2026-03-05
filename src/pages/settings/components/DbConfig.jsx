import { memo } from 'react';
import { T, ic } from '../../../constants/index.js';
import { Icon } from '../../../components/Icon.jsx';
import { Dot } from '../../../components/Dot.jsx';
import { Section } from '../../../components/Section.jsx';
import { Toggle } from '../../../components/Toggle.jsx';

export const DbConfig = memo(({ dbCfg, setDbCfg, dbOn, dbTest, dbError, dbLoading, handleTestDb, handleSaveDb }) => {
  return (
    <div className="card" style={{ marginBottom: 14 }}>
      <Section icon={ic.db} title="PostgreSQL Configuration">
        <Dot on={dbOn} />
      </Section>
      
      {dbLoading ? (
        <div style={{ textAlign: 'center', padding: '20px', color: T.textSec }}>
          <div className="spin" style={{ margin: '0 auto 10px' }} />
          Đang tải...
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
            <div>
              <span className="label-sm">HOST</span>
              <input
                className="inp"
                value={dbCfg.host}
                onChange={e => setDbCfg(p => ({ ...p, host: e.target.value }))}
                placeholder="localhost"
              />
            </div>
            <div>
              <span className="label-sm">PORT</span>
              <input
                className="inp"
                value={dbCfg.port}
                onChange={e => setDbCfg(p => ({ ...p, port: e.target.value }))}
                placeholder="5432"
              />
            </div>
          </div>
          
          <div style={{ marginBottom: 8 }}>
            <span className="label-sm">DATABASE</span>
            <input
              className="inp"
              value={dbCfg.database}
              onChange={e => setDbCfg(p => ({ ...p, database: e.target.value }))}
              placeholder="menas_dx_config"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            <div>
              <span className="label-sm">USER</span>
              <input
                className="inp"
                value={dbCfg.username}
                onChange={e => setDbCfg(p => ({ ...p, username: e.target.value }))}
                placeholder="postgres"
              />
            </div>
            <div>
              <span className="label-sm">PASSWORD</span>
              <input
                className="inp"
                type="password"
                value={dbCfg.password}
                onChange={e => setDbCfg(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Toggle on={dbCfg.ssl} onClick={() => setDbCfg(p => ({ ...p, ssl: !p.ssl }))} />
            <span style={{ fontSize: 12, color: T.textSec }}>SSL</span>
          </div>
          
          {dbError && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: T.danger + '18', color: T.danger, fontSize: 12, marginBottom: 12 }}>
              {dbError}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-p"
              onClick={handleSaveDb}
              disabled={dbLoading || !dbCfg.host || !dbCfg.database}
            >
              <Icon d={ic.check} s={13} /> Lưu cấu hình
            </button>
            <button
              className="btn btn-g"
              onClick={handleTestDb}
              disabled={dbTest || !dbCfg.host || !dbCfg.database}
            >
              {dbTest ? (
                <>
                  <div className="spin" style={{ width: 14, height: 14 }} /> Testing...
                </>
              ) : (
                <>
                  <Icon d={ic.play} s={13} /> Test kết nối
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
});

DbConfig.displayName = 'DbConfig';
