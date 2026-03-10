import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { T, ic } from '../constants/index.js';
import { useCustomers } from '../hooks/useCustomers.js';
import { formatValue, formatNumber } from '../utils/format.js';
import { Icon } from '../components/Icon.jsx';
import { Section } from '../components/Section.jsx';
import { Metric } from '../components/Metric.jsx';
import { Tier } from '../components/Tier.jsx';
import { ExportBtn } from '../components/ExportBtn.jsx';

const getDefaultFilter = () => {
  const today = new Date();
  const sixtyDaysAgo = new Date(today);
  sixtyDaysAgo.setDate(today.getDate() - 60);
  const lastPurchaseFrom = sixtyDaysAgo.toISOString().split('T')[0];
  const lastPurchaseTo = today.toISOString().split('T')[0];
  
  // Ngày kể từ lần mua cuối: từ 0 đến 60 ngày trước
  const daysSinceFrom = today.toISOString().split('T')[0];
  const daysSinceTo = sixtyDaysAgo.toISOString().split('T')[0];
  
  return {
    tiers: ['Platinum', 'Gold'], segments: ['Champions', 'Loyal'], categories: [],
    spendMin: '20000000', spendMax: '1000000000', ordersMin: '2', ordersMax: '1000',
    freqMin: '2', freqMax: '20', avgBasketMin: '100000', avgBasketMax: '5000000',
    daysSinceFrom, daysSinceTo,
    hasZalo: 'all', zaloFollow: 'all',
    stores: [], txnStores: [],
    lastPurchaseFrom, lastPurchaseTo, lastTxnAmtMin: '50000', lastTxnAmtMax: '10000000',
  };
};

const SEG_FILTER_INIT = getDefaultFilter();

const ALL_TIERS = ['Platinum', 'Gold', 'Silver'];
const ALL_SEGMENTS = ['Champions', 'Loyal', 'Potential', 'New', 'At Risk', 'Hibernating'];
const ALL_CATEGORIES = ['Thực phẩm', 'Đồ uống', 'Gia vị', 'Snack', 'Đông lạnh'];

function normalizeCustomer(c) {
  const totalSpent = Number(c.total_spent || 0);
  const totalOrders = Number(c.total_orders || 0);
  const freq = Number(c.frequency_month || 0);
  const lastPurchase = c.last_purchase ? new Date(c.last_purchase) : null;
  const daysSince = lastPurchase ? Math.floor((Date.now() - lastPurchase) / 864e5) : 999;
  let segment = 'Regular';
  if (totalSpent >= 50e6 && freq >= 4 && daysSince <= 30) segment = 'Champions';
  else if (totalSpent >= 20e6 && freq >= 2 && daysSince <= 60) segment = 'Loyal';
  else if (totalSpent >= 10e6 && freq >= 1 && daysSince <= 90) segment = 'Potential';
  else if (daysSince > 120 && daysSince <= 180) segment = 'At Risk';
  else if (daysSince > 180) segment = 'Hibernating';
  const formatDate = (ts) => {
    if (!ts) return '';
    if (typeof ts === 'string') return ts.split('T')[0] || ts.split(' ')[0] || ts;
    return ts;
  };
  return {
    id: c.MaTheKHTT || c.id,
    name: c.name || '',
    phone: c.phone || '',
    MaTheKHTT: c.MaTheKHTT || c.id,
    loyalty_tier: c.loyalty_tier || 'Silver',
    total_spent: totalSpent,
    total_orders: totalOrders,
    last_purchase: formatDate(c.last_purchase),
    first_purchase: formatDate(c.first_purchase),
    avg_basket: Number(c.avg_basket || 0),
    frequency_month: freq,
    top_categories: c.top_categories || [],
    top_products: c.top_products || [],
    segment,
    store_primary: c.store_primary || '',
    transaction_stores: c.transaction_stores || [],
    last_txn_amount: Number(c.last_txn_amount || 0),
    has_zalo: !!c.has_zalo,
    zalo_oa_follow: !!c.zalo_oa_follow,
  };
}

export function Segment({ dbOn, demoData, canExport, addLog }) {
  const navigate = useNavigate();
  const { data: apiData, loading, error } = useCustomers(dbOn, { limit: 5000, offset: 0 });

  const [segF, setSegF] = useState(() => getDefaultFilter());
  const [segRes, setSegRes] = useState(null);
  const [selCamp, setSelCamp] = useState([]);
  const autoAppliedRef = useRef(false);

  const customers = useMemo(() => {
    if (dbOn && apiData?.data) {
      return apiData.data.map(normalizeCustomer);
    }
    return (demoData?.customers || []).map((c) => {
      const base = normalizeCustomer({ ...c, MaTheKHTT: c.MaTheKHTT || c.id });
      return { ...base, segment: c.segment || base.segment, top_categories: c.top_categories || base.top_categories, transaction_stores: c.transaction_stores || base.transaction_stores, has_zalo: c.has_zalo ?? base.has_zalo, zalo_oa_follow: c.zalo_oa_follow ?? base.zalo_oa_follow, last_txn_amount: c.last_txn_amount ?? base.last_txn_amount };
    });
  }, [dbOn, apiData, demoData]);

  const allStores = useMemo(() => [...new Set(customers.map((c) => c.store_primary).filter(Boolean))], [customers]);
  const allCategories = useMemo(() => {
    const set = new Set();
    customers.forEach((c) => (c.top_categories || []).forEach((cat) => set.add(cat)));
    return [...set];
  }, [customers]);

  // Auto-apply filter when data is loaded (only once)
  useEffect(() => {
    if (customers.length > 0 && segRes === null && !loading && !autoAppliedRef.current) {
      autoAppliedRef.current = true;
      setTimeout(() => {
        applyF();
      }, 100);
    }
  }, [customers.length, loading]);

  const applyF = () => {
    if (customers.length === 0) {
      console.warn('[Segment] No customers data available');
      setSegRes([]);
      setSelCamp([]);
      return;
    }
    let list = [...customers];
    const f = segF;
    console.log('[Segment] Applying filters:', f, 'on', customers.length, 'customers');
    if (f.tiers.length) list = list.filter((c) => f.tiers.includes(c.loyalty_tier));
    if (f.segments.length) list = list.filter((c) => f.segments.includes(c.segment));
    if (f.categories.length) list = list.filter((c) => (c.top_categories || []).some((cat) => f.categories.includes(cat)));
    if (f.spendMin) list = list.filter((c) => c.total_spent >= +f.spendMin);
    if (f.spendMax) list = list.filter((c) => c.total_spent <= +f.spendMax);
    if (f.ordersMin) list = list.filter((c) => c.total_orders >= +f.ordersMin);
    if (f.ordersMax) list = list.filter((c) => c.total_orders <= +f.ordersMax);
    if (f.freqMin) list = list.filter((c) => c.frequency_month >= +f.freqMin);
    if (f.freqMax) list = list.filter((c) => c.frequency_month <= +f.freqMax);
    if (f.avgBasketMin) list = list.filter((c) => c.avg_basket >= +f.avgBasketMin);
    if (f.avgBasketMax) list = list.filter((c) => c.avg_basket <= +f.avgBasketMax);
    if (f.daysSinceFrom || f.daysSinceTo) {
      list = list.filter((c) => {
        if (!c.last_purchase) return false;
        const lastPurchaseDate = c.last_purchase.split('T')[0];
        return (!f.daysSinceFrom || lastPurchaseDate >= f.daysSinceFrom) && (!f.daysSinceTo || lastPurchaseDate <= f.daysSinceTo);
      });
    }
    if (f.hasZalo === 'yes') list = list.filter((c) => c.has_zalo);
    if (f.hasZalo === 'no') list = list.filter((c) => !c.has_zalo);
    if (f.zaloFollow === 'yes') list = list.filter((c) => c.zalo_oa_follow);
    if (f.zaloFollow === 'no') list = list.filter((c) => !c.zalo_oa_follow);
    if (f.stores.length) list = list.filter((c) => f.stores.includes(c.store_primary));
    if (f.txnStores.length) list = list.filter((c) => (c.transaction_stores || []).some((s) => f.txnStores.includes(s)));
    if (f.lastPurchaseFrom) list = list.filter((c) => c.last_purchase >= f.lastPurchaseFrom);
    if (f.lastPurchaseTo) list = list.filter((c) => c.last_purchase <= f.lastPurchaseTo);
    if (f.lastTxnAmtMin) list = list.filter((c) => (c.last_txn_amount || 0) >= +f.lastTxnAmtMin);
    if (f.lastTxnAmtMax) list = list.filter((c) => (c.last_txn_amount || 0) <= +f.lastTxnAmtMax);
    console.log('[Segment] Filter result:', list.length, 'customers');
    setSegRes(list);
    setSelCamp(list.map((c) => c.id));
    addLog?.('filter', 'segment', `Lọc KH: ${list.length} KH phù hợp${f.tiers.length ? ' — Tier: ' + f.tiers.join(',') : ''}${f.segments.length ? ' — Seg: ' + f.segments.join(',') : ''}`);
  };

  const resetF = () => {
    setSegF(getDefaultFilter());
    setSegRes(null);
    setSelCamp([]);
    autoAppliedRef.current = false;
  };

  const togChip = (k, v) => {
    setSegF((p) => ({
      ...p,
      [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v],
    }));
  };

  const res = segRes || [];
  const totalSpentRes = res.reduce((s, c) => s + c.total_spent, 0);
  const avgFreqRes = res.length ? res.reduce((s, c) => s + c.frequency_month, 0) / res.length : 0;
  const withZalo = res.filter((c) => c.has_zalo).length;
  const withFollow = res.filter((c) => c.zalo_oa_follow).length;

  const handleGửiZNS = () => navigate('/zalo', { state: { fromSegment: true, segmentCustomerIds: selCamp, segmentCustomers: res } });
  const handleHỏiAI = () => {
    const prompt = `Phân tích tệp ${res.length} KH vừa lọc: ${res.slice(0, 10).map((c) => `${c.name} (${c.segment}, ${formatValue(c.total_spent)})`).join(', ')}${res.length > 10 ? '...' : ''}. Đề xuất chiến dịch phù hợp.`;
    navigate('/ai_chat', { state: { initialPrompt: prompt } });
  };

  const exportData = res.map((c) => ({
    MaTheKHTT: c.MaTheKHTT, Ten: c.name, SoDienThoai: c.phone, HangLoyalty: c.loyalty_tier,
    TongChiTieu: c.total_spent, SoDonHang: c.total_orders, TanSuat: c.frequency_month,
    AOV: c.avg_basket, Segment: c.segment, CuaHang: c.store_primary,
    CoZalo: c.has_zalo ? 'Có' : 'Không', FollowOA: c.zalo_oa_follow ? 'Có' : 'Không',
    DanhMuc: (c.top_categories || []).join('; '),
  }));

  const categoriesList = allCategories.length ? allCategories : ALL_CATEGORIES;

  // Debug info
  console.log('[Segment] Debug:', {
    dbOn,
    loading,
    error,
    apiData: apiData ? { total: apiData.total, dataLength: apiData.data?.length } : null,
    customersLength: customers.length,
    demoDataLength: demoData?.customers?.length
  });

  if (dbOn && loading) {
    return (
      <div className="fu" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="spin" style={{ width: 20, height: 20, borderWidth: 2 }} />
        <span style={{ color: T.textSec }}>Đang tải dữ liệu từ database...</span>
      </div>
    );
  }

  if (dbOn && error) {
    return (
      <div className="fu" style={{ padding: 24 }}>
        <div style={{ fontSize: 12, color: T.danger, marginBottom: 8 }}>Lỗi tải dữ liệu: {error}</div>
        <div style={{ fontSize: 11, color: T.textMuted }}>Kiểm tra console để xem chi tiết lỗi</div>
      </div>
    );
  }

  if (dbOn && !loading && !error && (!apiData || !apiData.data || apiData.data.length === 0)) {
    return (
      <div className="fu" style={{ padding: 24 }}>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 8 }}>Không có dữ liệu khách hàng từ database</div>
        <div style={{ fontSize: 11, color: T.textMuted }}>Vui lòng kiểm tra:</div>
        <ul style={{ fontSize: 11, color: T.textMuted, marginTop: 8, paddingLeft: 20 }}>
          <li>Backend server có đang chạy không</li>
          <li>Database connection có hoạt động không (Settings → Database)</li>
          <li>Bảng datamart_customer có dữ liệu không</li>
        </ul>
      </div>
    );
  }

  return (
    <div className="fu">
      <div className="card" style={{ marginBottom: 14 }}>
        <Section icon={ic.sliders} title="Bộ lọc khách hàng nâng cao">
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button className="btn btn-p btn-sm" onClick={applyF} disabled={customers.length === 0}><Icon d={ic.filter} s={12} /> Áp dụng</button>
            <button className="btn btn-g btn-sm" onClick={resetF}><Icon d={ic.x} s={12} /> Reset</button>
            {dbOn && (
              <div style={{ fontSize: 10, color: T.textMuted, marginLeft: 'auto' }}>
                {loading ? 'Đang tải...' : error ? 'Lỗi' : apiData ? `${customers.length} KH` : 'Chưa tải'}
              </div>
            )}
          </div>
        </Section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <span className="label-sm">Hạng Loyalty</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
              {ALL_TIERS.map((t) => (
                <button key={t} className={`chip ${segF.tiers.includes(t) ? 'on' : ''}`} onClick={() => togChip('tiers', t)}><Icon d={ic.star} s={10} />{t}</button>
              ))}
            </div>
          </div>
          <div>
            <span className="label-sm">RFM Segment</span>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
              {ALL_SEGMENTS.map((s) => (
                <button key={s} className={`chip ${segF.segments.includes(s) ? 'on' : ''}`} onClick={() => togChip('segments', s)}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <span className="label-sm">Danh mục sản phẩm đã mua</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
            {categoriesList.map((c) => (
              <button key={c} className={`chip ${segF.categories.includes(c) ? 'on' : ''}`} onClick={() => togChip('categories', c)}><Icon d={ic.package} s={10} />{c}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <span className="label-sm">Tổng chi tiêu (VNĐ)</span>
            <div className="range-row" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <input className="inp" placeholder="Từ" value={segF.spendMin} onChange={(e) => setSegF((p) => ({ ...p, spendMin: e.target.value }))} />
              <span style={{ color: T.textMuted }}>—</span>
              <input className="inp" placeholder="Đến" value={segF.spendMax} onChange={(e) => setSegF((p) => ({ ...p, spendMax: e.target.value }))} />
            </div>
          </div>
          <div>
            <span className="label-sm">Số đơn hàng</span>
            <div className="range-row" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <input className="inp" placeholder="Từ" value={segF.ordersMin} onChange={(e) => setSegF((p) => ({ ...p, ordersMin: e.target.value }))} />
              <span style={{ color: T.textMuted }}>—</span>
              <input className="inp" placeholder="Đến" value={segF.ordersMax} onChange={(e) => setSegF((p) => ({ ...p, ordersMax: e.target.value }))} />
            </div>
          </div>
          <div>
            <span className="label-sm">Tần suất / tháng</span>
            <div className="range-row" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <input className="inp" placeholder="Từ" value={segF.freqMin} onChange={(e) => setSegF((p) => ({ ...p, freqMin: e.target.value }))} />
              <span style={{ color: T.textMuted }}>—</span>
              <input className="inp" placeholder="Đến" value={segF.freqMax} onChange={(e) => setSegF((p) => ({ ...p, freqMax: e.target.value }))} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <span className="label-sm">AOV</span>
            <div className="range-row" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <input className="inp" placeholder="Từ" value={segF.avgBasketMin} onChange={(e) => setSegF((p) => ({ ...p, avgBasketMin: e.target.value }))} />
              <span style={{ color: T.textMuted }}>—</span>
              <input className="inp" placeholder="Đến" value={segF.avgBasketMax} onChange={(e) => setSegF((p) => ({ ...p, avgBasketMax: e.target.value }))} />
            </div>
          </div>
          <div>
            <span className="label-sm">Ngày kể từ lần mua cuối</span>
            <div className="range-row" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <DatePicker
                selected={segF.daysSinceFrom ? new Date(segF.daysSinceFrom) : null}
                onChange={(date) => setSegF((p) => ({ ...p, daysSinceFrom: date ? date.toISOString().split('T')[0] : '' }))}
                dateFormat="dd/MM/yyyy"
                placeholderText="Từ ngày"
                className="inp"
                wrapperClassName="date-picker-wrapper"
              />
              <span style={{ color: T.textMuted }}>—</span>
              <DatePicker
                selected={segF.daysSinceTo ? new Date(segF.daysSinceTo) : null}
                onChange={(date) => setSegF((p) => ({ ...p, daysSinceTo: date ? date.toISOString().split('T')[0] : '' }))}
                dateFormat="dd/MM/yyyy"
                placeholderText="Đến ngày"
                className="inp"
                wrapperClassName="date-picker-wrapper"
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <span className="label-sm">Cửa hàng chính</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
            {allStores.map((s) => (
              <button key={s} className={`chip ${segF.stores.includes(s) ? 'on' : ''}`} onClick={() => togChip('stores', s)}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <span className="label-sm">Nơi phát sinh giao dịch</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
            {allStores.map((s) => (
              <button key={s} className={`chip ${segF.txnStores.includes(s) ? 'on' : ''}`} onClick={() => togChip('txnStores', s)}><Icon d={ic.map} s={10} />{s}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <span className="label-sm">Lần GD gần nhất (từ ngày)</span>
            <div className="range-row" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <DatePicker
                selected={segF.lastPurchaseFrom ? new Date(segF.lastPurchaseFrom) : null}
                onChange={(date) => setSegF((p) => ({ ...p, lastPurchaseFrom: date ? date.toISOString().split('T')[0] : '' }))}
                dateFormat="dd/MM/yyyy"
                placeholderText="Từ ngày"
                className="inp"
                wrapperClassName="date-picker-wrapper"
              />
              <span style={{ color: T.textMuted }}>—</span>
              <DatePicker
                selected={segF.lastPurchaseTo ? new Date(segF.lastPurchaseTo) : null}
                onChange={(date) => setSegF((p) => ({ ...p, lastPurchaseTo: date ? date.toISOString().split('T')[0] : '' }))}
                dateFormat="dd/MM/yyyy"
                placeholderText="Đến ngày"
                className="inp"
                wrapperClassName="date-picker-wrapper"
              />
            </div>
          </div>
          <div>
            <span className="label-sm">Số tiền GD gần nhất (VNĐ)</span>
            <div className="range-row" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <input className="inp" placeholder="Từ" value={segF.lastTxnAmtMin} onChange={(e) => setSegF((p) => ({ ...p, lastTxnAmtMin: e.target.value }))} />
              <span style={{ color: T.textMuted }}>—</span>
              <input className="inp" placeholder="Đến" value={segF.lastTxnAmtMax} onChange={(e) => setSegF((p) => ({ ...p, lastTxnAmtMax: e.target.value }))} />
            </div>
          </div>
          <div>
            <span className="label-sm">Zalo</span>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <select className="inp" value={segF.hasZalo} onChange={(e) => setSegF((p) => ({ ...p, hasZalo: e.target.value }))}>
                <option value="all">Tất cả</option>
                <option value="yes">Có Zalo</option>
                <option value="no">Không</option>
              </select>
              <select className="inp" value={segF.zaloFollow} onChange={(e) => setSegF((p) => ({ ...p, zaloFollow: e.target.value }))}>
                <option value="all">OA</option>
                <option value="yes">Follow</option>
                <option value="no">Chưa</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {segRes !== null && (
        <div className="fu">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
            <Metric icon={ic.userCheck} label="KH phù hợp" value={formatNumber(res.length)} sub={`/${formatNumber(customers.length)}`} idx={1} />
            <Metric icon={ic.dollar} label="Tổng chi tệp" value={formatValue(totalSpentRes)} idx={2} />
            <Metric icon={ic.repeat} label="Tần suất TB" value={avgFreqRes.toFixed(1)} idx={3} />
            <Metric icon={ic.msg} label="Có Zalo" value={withZalo} sub={`${withFollow} follow`} idx={4} />
          </div>
          <div className="card" style={{ marginBottom: 12 }}>
            <Section icon={ic.users} title={`Tệp KH (${res.length})`}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-z btn-sm" onClick={handleGửiZNS} disabled={res.length === 0}><Icon d={ic.send} s={12} /> Gửi ZNS</button>
                <button className="btn btn-ai btn-sm" onClick={handleHỏiAI} disabled={res.length === 0}><Icon d={ic.brain} s={12} /> Hỏi AI</button>
                <ExportBtn canExport={canExport} data={exportData} filename={`segment_filter_${res.length}kh`} />
              </div>
            </Section>
            {res.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: T.textMuted }}>
                <Icon d={ic.users} s={32} c={T.textMuted} />
                <div style={{ marginTop: 12, fontSize: 13 }}>Không có khách hàng nào phù hợp với bộ lọc</div>
                <div style={{ marginTop: 4, fontSize: 11 }}>Thử điều chỉnh các tiêu chí lọc hoặc nhấn Reset để xem tất cả</div>
              </div>
            ) : (
              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      {['', 'Mã', 'Tên', 'Hạng', 'Chi tiêu', 'Đơn', 'Tần suất', 'Danh mục', 'Segment', 'Zalo'].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {res.map((c) => (
                      <tr key={c.id} className="rh">
                        <td>
                          <input type="checkbox" checked={selCamp.includes(c.id)} onChange={() => setSelCamp((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))} />
                        </td>
                        <td style={{ color: T.accent, fontWeight: 600, fontSize: 11 }}>{c.MaTheKHTT}</td>
                        <td style={{ fontWeight: 600, fontSize: 12 }}>{c.name}</td>
                        <td><Tier t={c.loyalty_tier} /></td>
                        <td className="counter" style={{ fontSize: 11 }}>{formatValue(c.total_spent)}</td>
                        <td>{c.total_orders}</td>
                        <td style={{ color: T.info, fontWeight: 600 }}>{c.frequency_month}</td>
                        <td style={{ fontSize: 10, color: T.textSec }}>{(c.top_categories || []).slice(0, 2).join(', ')}</td>
                        <td>
                          <span className="badge" style={{ background: `${c.segment === 'Champions' ? T.success : T.info}18`, color: c.segment === 'Champions' ? T.success : T.info, fontSize: 9 }}>{c.segment}</span>
                        </td>
                        <td>{c.has_zalo ? <Icon d={ic.check} s={12} c={T.success} /> : <Icon d={ic.x} s={12} c={T.textMuted} />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {!dbOn && customers.length === 0 && (
        <div className="fu" style={{ padding: 24, textAlign: 'center', color: T.textMuted }}>
          <Icon d={ic.database} s={32} c={T.textMuted} />
          <div style={{ marginTop: 12, fontSize: 13 }}>Chưa có dữ liệu khách hàng</div>
          <div style={{ marginTop: 4, fontSize: 11 }}>Vui lòng bật kết nối database hoặc tải dữ liệu demo</div>
        </div>
      )}
    </div>
  );
}
