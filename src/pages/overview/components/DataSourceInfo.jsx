import { memo } from 'react';
import { T, ic } from '../../../constants/index.js';
import { Section } from '../../../components/Section.jsx';

export const DataSourceInfo = memo(({ dbOn }) => {
  return (
    <div className="card fu fu4">
      <Section icon={ic.bar} title="Nguồn dữ liệu" sql={!!dbOn} />
      <div style={{ padding: '12px 0', fontSize: 13, color: T.textSec }}>
        {dbOn ? (
          <>Lấy từ <strong style={{ color: T.success }}>database bên ngoài</strong> theo cấu hình đã lưu trong <strong>db_config</strong> (datamart_customer, datamart_transaction).</>
        ) : (
          <>Đang dùng <strong style={{ color: T.warning }}>dữ liệu demo</strong>. Cài đặt → Lưu cấu hình DB để lấy dữ liệu từ database bên ngoài.</>
        )}
      </div>
    </div>
  );
});

DataSourceInfo.displayName = 'DataSourceInfo';
