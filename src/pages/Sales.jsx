import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, AreaChart, Area
} from 'recharts';
import { T, ic, CL, tooltipStyle } from '../constants/index.js';
import { Section } from '../components/Section.jsx';
import { ExportBtn } from '../components/ExportBtn.jsx';
import { Icon } from '../components/Icon.jsx';
import { useSales } from '../hooks/useSales.js';
import { transformSalesData } from '../utils/salesData.js';
import { formatValue } from '../utils/format.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

const tt = tooltipStyle;

export function Sales({ dbOn, demoData, canExport }) {
  const [showFilter, setShowFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [store, setStore] = useState('all');
  const [category, setCategory] = useState('all');
  const [voucher, setVoucher] = useState('all');

  const filterParams = useMemo(() => {
    const p = {};
    if (dateFrom) p.dateFrom = dateFrom;
    if (dateTo) p.dateTo = dateTo;
    if (store !== 'all') p.store = store;
    if (category !== 'all') p.category = category;
    if (voucher !== 'all') p.voucher = voucher;
    return p;
  }, [dateFrom, dateTo, store, category, voucher]);

  const { data: apiData, loading, error } = useSales(dbOn, filterParams);
  const { catPerf, payments, hourly, discount, stores, categories, vouchers } = useMemo(
    () => transformSalesData(dbOn, apiData, error, demoData),
    [dbOn, apiData, error, demoData]
  );
  const isMobile = useBreakpoint(768);
  const hasActiveFilter = dateFrom || dateTo || store !== 'all' || category !== 'all' || voucher !== 'all';

  const resetFilter = () => {
    setDateFrom('');
    setDateTo('');
    setStore('all');
    setCategory('all');
    setVoucher('all');
  };

  if (loading && dbOn) {
    return (
      <div className="fu" style={{ padding: 24, textAlign: 'center' }}>
        <div className="spin" style={{ width: 28, height: 28, margin: '0 auto 12px', borderWidth: 3 }} />
        <div style={{ fontSize: 14, color: T.textSec }}>Đang tải dữ liệu Sales...</div>
      </div>
    );
  }

  return (
    <div className="fu">
      {/* Filter bar */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: showFilter ? 12 : 0, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${showFilter || hasActiveFilter ? 'btn-p' : 'btn-g'}`}
            onClick={() => setShowFilter(!showFilter)}
          >
            <Icon d={ic.filter} s={12} /> Lọc {hasActiveFilter ? '(*)' : ''}
          </button>
        </div>
        {showFilter && (
          <div style={{ padding: 14, borderRadius: 10, background: T.surfaceAlt, border: `1px solid ${T.cardBorder}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>Bộ lọc</span>
              <button className="btn btn-g btn-sm" onClick={resetFilter} style={{ padding: '3px 10px', fontSize: 10 }}>
                <Icon d={ic.x} s={10} /> Xoá lọc
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr 1fr', gap: 10 }}>
              <div>
                <span className="label-sm">Từ ngày</span>
                <input type="date" className="inp" style={{ fontSize: 12 }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </div>
              <div>
                <span className="label-sm">Đến ngày</span>
                <input type="date" className="inp" style={{ fontSize: 12 }} value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </div>
              <div>
                <span className="label-sm">Cửa hàng</span>
                <select className="inp" value={store} onChange={e => setStore(e.target.value)}>
                  <option value="all">Tất cả</option>
                  {(stores || []).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <span className="label-sm">Danh mục</span>
                <select className="inp" value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="all">Tất cả</option>
                  {(categories || []).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {vouchers?.length > 0 && (
                <div>
                  <span className="label-sm">Mã giảm giá</span>
                  <select className="inp" value={voucher} onChange={e => setVoucher(e.target.value)}>
                    <option value="all">Tất cả</option>
                    {vouchers.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              )}
            </div>
            {hasActiveFilter && (
              <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {dateFrom && <span className="badge" style={{ background: T.accent + '18', color: T.accent }}>Từ {dateFrom} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setDateFrom('')}>x</span></span>}
                {dateTo && <span className="badge" style={{ background: T.accent + '18', color: T.accent }}>Đến {dateTo} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setDateTo('')}>x</span></span>}
                {store !== 'all' && <span className="badge" style={{ background: T.info + '18', color: T.info }}>{store} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setStore('all')}>x</span></span>}
                {category !== 'all' && <span className="badge" style={{ background: T.success + '18', color: T.success }}>{category} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setCategory('all')}>x</span></span>}
                {voucher !== 'all' && <span className="badge" style={{ background: T.purple + '18', color: T.purple }}>{voucher} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setVoucher('all')}>x</span></span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phân tích giảm giá */}
      {(discount?.total > 0 || (discount?.by_voucher?.length || discount?.by_rate?.length)) && (
        <div className="card" style={{ marginBottom: 14 }}>
          <Section icon={ic.gift} title="Phân tích giảm giá" sql={!!dbOn} />
          {/* Tóm tắt */}
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16, padding: '12px 16px', borderRadius: 10, background: T.success + '08', border: `1px solid ${T.success}25` }}>
            <div>
              <div style={{ fontSize: 11, color: T.textSec, marginBottom: 2 }}>Tổng tiền khách được giảm (voucher, khuyến mãi)</div>
              <div className="counter" style={{ fontSize: 24, fontWeight: 800, color: T.success }}>{formatValue(discount?.total || 0)}</div>
            </div>
            {discount?.gross_revenue > 0 && (
              <div style={{ fontSize: 13, color: T.textSec }}>
                Chiếm <strong style={{ color: T.accent }}>{((discount.total / discount.gross_revenue) * 100).toFixed(1)}%</strong> doanh thu trước giảm
              </div>
            )}
          </div>
          {/* Bảng: Theo mức chiết khấu */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon d={ic.bar} s={12} c={T.accent} />
              Phân bổ theo mức chiết khấu (ví dụ: giảm 5%, 10%, 20%...)
            </div>
            <div className="tw">
              <table style={{ width: '100%', fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: T.textMuted, fontWeight: 600 }}>Mức chiết khấu</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: T.textMuted, fontWeight: 600 }}>Số tiền giảm</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: T.textMuted, fontWeight: 600 }}>Số đơn</th>
                    <th style={{ textAlign: 'right', padding: '6px 8px', color: T.textMuted, fontWeight: 600 }}>% tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {(discount?.by_rate || []).map((r, i) => (
                    <tr key={i} style={{ borderTop: `1px solid ${T.cardBorder}` }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{r.type}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: T.success, fontWeight: 600 }}>{formatValue(r.amount)}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: T.textSec }}>{r.orders.toLocaleString('vi-VN')}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: T.textSec }}>{discount?.total ? ((r.amount / discount.total) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!discount?.by_rate?.length) && <div style={{ padding: 12, color: T.textMuted, fontSize: 12 }}>Chưa có dữ liệu theo mức chiết khấu</div>}
          </div>
          {/* Bảng: Theo mã voucher */}
          {(discount?.by_voucher?.length || 0) > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon d={ic.gift} s={12} c={T.purple} />
                Phân bổ theo mã voucher (SINHNHAT20, FLASH15...)
              </div>
              <div className="tw">
                <table style={{ width: '100%', fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '6px 8px', color: T.textMuted, fontWeight: 600 }}>Mã voucher</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', color: T.textMuted, fontWeight: 600 }}>Số tiền giảm</th>
                      <th style={{ textAlign: 'right', padding: '6px 8px', color: T.textMuted, fontWeight: 600 }}>Số đơn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(discount?.by_voucher || []).map((v, i) => (
                      <tr key={i} style={{ borderTop: `1px solid ${T.cardBorder}` }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{v.type}</td>
                        <td style={{ padding: '8px', textAlign: 'right', color: T.success }}>{formatValue(v.amount)}</td>
                        <td style={{ padding: '8px', textAlign: 'right', color: T.textSec }}>{v.orders.toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Giảm theo danh mục sản phẩm */}
          {catPerf.some(c => c.discount > 0) && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon d={ic.package} s={12} c={T.info} />
                Giảm giá theo danh mục sản phẩm
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {catPerf.filter(c => c.discount > 0).map((c, i) => (
                  <span key={i} className="badge" style={{ background: T.success + '15', color: T.success, padding: '6px 12px' }}>
                    {c.name}: {formatValue(c.discount)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <div className="card">
          <Section icon={ic.bar} title="Doanh thu danh mục" sql={!!dbOn}>
            <ExportBtn
              canExport={canExport}
              data={catPerf.map((c) => ({ DanhMuc: c.name, DoanhThu: c.revenue, GiamGia: c.discount || 0, SoDon: c.orders }))}
              filename="sales_categories"
            />
          </Section>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catPerf} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
              <XAxis type="number" stroke={T.textMuted} fontSize={11} tickFormatter={(v) => formatValue(v)} />
              <YAxis type="category" dataKey="name" stroke={T.textMuted} fontSize={11} width={70} />
              <Tooltip {...tt} formatter={(v) => formatValue(v)} content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const d = payload[0].payload;
                return (
                  <div style={{ ...tt.contentStyle, padding: 10 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
                    <div>Doanh thu: {formatValue(d.revenue)}</div>
                    {d.discount > 0 && <div style={{ color: T.success }}>Giảm giá: {formatValue(d.discount)}</div>}
                    <div>Đơn: {d.orders}</div>
                  </div>
                );
              }} />
              <Bar dataKey="revenue" radius={[0, 6, 6, 0]} name="Doanh thu">
                {catPerf.map((_, i) => (
                  <Cell key={i} fill={CL[i % CL.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <Section icon={ic.gift} title="Thanh toán" sql={!!dbOn} />
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={payments}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={68}
                paddingAngle={4}
                dataKey="amount"
                nameKey="method"
              >
                {payments.map((_, i) => (
                  <Cell key={i} fill={CL[i % CL.length]} />
                ))}
              </Pie>
              <Tooltip {...tt} formatter={(v) => formatValue(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {payments.map((p, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: CL[i % CL.length],
                    display: 'inline-block'
                  }}
                />
                {p.method}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <Section icon={ic.clock} title="Đơn hàng theo giờ" sql={!!dbOn} />
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={hourly}>
            <CartesianGrid strokeDasharray="3 3" stroke={T.cardBorder} />
            <XAxis dataKey="hour" stroke={T.textMuted} fontSize={10} />
            <YAxis stroke={T.textMuted} fontSize={10} />
            <Tooltip {...tt} />
            <Area type="monotone" dataKey="orders" stroke={T.accent} fill={`${T.accent}30`} strokeWidth={2} name="Đơn" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
