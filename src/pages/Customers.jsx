import { useState, useMemo, useEffect } from 'react';
import { T, ic, CL } from '../constants/index.js';
import { useCustomers } from '../hooks/useCustomers.js';
import { formatValue, formatNumber } from '../utils/format.js';
import { Icon } from '../components/Icon.jsx';
import { Tier } from '../components/Tier.jsx';
import { ExportBtn } from '../components/ExportBtn.jsx';
import { DEMO } from '../data/demo.js';
import { dbApi, aiApi } from '../services/api.js';
import { useBreakpoint } from '../hooks/useBreakpoint.js';

// Demo orders data - sẽ được thay thế bằng API
const DEMO_ORDERS = {
  "1": [
    { id: "HD001", date: "2025-05-28", store: "CH Nguyễn Huệ", pay: "Tiền mặt", total: 850000, disc: 0, pts: 85, status: "done", items: [{ sku: "SP001", name: "Premium A", price: 250000, qty: 2, cat: "Thực phẩm", amt: 500000 }, { sku: "SP002", name: "Gold B", price: 350000, qty: 1, cat: "Đồ uống", amt: 350000 }], sub: 850000 }
  ],
  "2": [
    { id: "HD002", date: "2025-05-27", store: "CH Lê Lợi", pay: "Chuyển khoản", total: 520000, disc: 20000, pts: 50, status: "done", items: [{ sku: "SP003", name: "Gold B", price: 350000, qty: 1, cat: "Đồ uống", amt: 350000 }, { sku: "SP004", name: "Snack P", price: 95000, qty: 2, cat: "Snack", amt: 190000 }], sub: 540000 }
  ],
  "3": [
    { id: "HD003a", date: "2025-05-20", store: "CH Phạm Ngọc Thạch", pay: "Tiền mặt", total: 380000, disc: 0, pts: 38, status: "done", items: [{ sku: "SP001", name: "Premium A", price: 250000, qty: 1, cat: "Thực phẩm", amt: 250000 }, { sku: "SP002", name: "Gold B", price: 130000, qty: 1, cat: "Đồ uống", amt: 130000 }], sub: 380000 }
  ],
  "4": [
    { id: "HD004a", date: "2025-05-25", store: "CH Hai Bà Trưng", pay: "Thẻ", total: 620000, disc: 30000, pts: 59, status: "done", items: [{ sku: "SP002", name: "Gold B", price: 350000, qty: 1, cat: "Đồ uống", amt: 350000 }, { sku: "SP005", name: "Đông lạnh X", price: 300000, qty: 1, cat: "Đông lạnh", amt: 300000 }], sub: 650000 }
  ],
  "5": [
    { id: "HD005a", date: "2025-04-15", store: "CH Cách Mạng T8", pay: "Tiền mặt", total: 290000, disc: 0, pts: 29, status: "done", items: [{ sku: "SP006", name: "Gia vị ĐB", price: 150000, qty: 1, cat: "Gia vị", amt: 150000 }, { sku: "SP004", name: "Snack P", price: 140000, qty: 1, cat: "Snack", amt: 140000 }], sub: 290000 }
  ],
  "6": [
    { id: "HD006a", date: "2025-05-29", store: "CH Nguyễn Huệ", pay: "Thẻ", total: 1200000, disc: 50000, pts: 115, status: "done", items: [{ sku: "SP001", name: "Premium A", price: 250000, qty: 2, cat: "Thực phẩm", amt: 500000 }, { sku: "SP002", name: "Gold B", price: 350000, qty: 1, cat: "Đồ uống", amt: 350000 }, { sku: "SP004", name: "Snack P", price: 450000, qty: 1, cat: "Snack", amt: 450000 }], sub: 1300000 },
    { id: "HD006b", date: "2025-05-22", store: "CH Lê Lợi", pay: "Chuyển khoản", total: 780000, disc: 0, pts: 78, status: "done", items: [{ sku: "SP001", name: "Premium A", price: 250000, qty: 1, cat: "Thực phẩm", amt: 250000 }, { sku: "SP002", name: "Gold B", price: 350000, qty: 1, cat: "Đồ uống", amt: 350000 }, { sku: "SP006", name: "Gia vị ĐB", price: 180000, qty: 1, cat: "Gia vị", amt: 180000 }], sub: 780000 },
    { id: "HD006c", date: "2025-05-15", store: "CH Phạm Ngọc Thạch", pay: "Tiền mặt", total: 520000, disc: 0, pts: 52, status: "done", items: [{ sku: "SP002", name: "Gold B", price: 350000, qty: 1, cat: "Đồ uống", amt: 350000 }, { sku: "SP004", name: "Snack P", price: 170000, qty: 1, cat: "Snack", amt: 170000 }], sub: 520000 }
  ],
  "7": [
    { id: "HD007a", date: "2025-03-10", store: "CH Lê Lợi", pay: "Tiền mặt", total: 180000, disc: 0, pts: 18, status: "done", items: [{ sku: "SP002", name: "Gold B", price: 180000, qty: 1, cat: "Đồ uống", amt: 180000 }], sub: 180000 }
  ],
  "8": [
    { id: "HD008a", date: "2025-05-22", store: "CH Phạm Ngọc Thạch", pay: "Thẻ", total: 450000, disc: 0, pts: 45, status: "done", items: [{ sku: "SP001", name: "Premium A", price: 250000, qty: 1, cat: "Thực phẩm", amt: 250000 }, { sku: "SP005", name: "Đông lạnh X", price: 200000, qty: 1, cat: "Đông lạnh", amt: 200000 }], sub: 450000 }
  ],
};

export function Customers({ dbOn, demoData, canExport, addLog }) {
  const [searchQ, setSearchQ] = useState('');
  const [custShowFilter, setCustShowFilter] = useState(false);
  const [custStore, setCustStore] = useState('all');
  const [custTier, setCustTier] = useState('all');
  const [custSegment, setCustSegment] = useState('all');
  const [custSpendMin, setCustSpendMin] = useState('');
  const [custSpendMax, setCustSpendMax] = useState('');
  const [custLastFrom, setCustLastFrom] = useState('');
  const [custLastTo, setCustLastTo] = useState('');
  const [custSort, setCustSort] = useState('total_spent_desc');
  const [selCustomer, setSelCustomer] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  const [orderStore, setOrderStore] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerOrdersTotal, setCustomerOrdersTotal] = useState(null);
  const [customerPersona, setCustomerPersona] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAiAnalysis, setLoadingAiAnalysis] = useState(false);
  const [aiAnalysisError, setAiAnalysisError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const isMobile = useBreakpoint(768);

  const { data: apiData, loading, error } = useCustomers(dbOn, { limit: 1000, offset: 0 });
  
  useEffect(() => {
    if (selCustomer) {
      setOrderDateFrom('');
      setOrderDateTo('');
      setOrderStore('all');
    }
  }, [selCustomer?.MaTheKHTT, selCustomer?.id]);

  // Load customer details và orders khi chọn khách hàng
  useEffect(() => {
    if (!selCustomer || !dbOn) {
      setCustomerDetails(null);
      setCustomerOrders([]);
      setCustomerOrdersTotal(null);
      setCustomerPersona(null);
      setAiAnalysis(null);
      setAiAnalysisError(null);
      return;
    }
    
    const loadDetails = async () => {
      setLoadingDetails(true);
      try {
        const res = await dbApi.getCustomerModal(selCustomer.MaTheKHTT);
        setCustomerDetails(res.details || {});
        setCustomerOrders(res.orders?.data || []);
        // Use total from API response (this is the actual count from database)
        // Use total from API response (this is the actual count from database)
        // Always use total from API if provided, even if it's 0
        const totalFromApi = res.orders?.total;
        if (totalFromApi !== undefined && totalFromApi !== null) {
          setCustomerOrdersTotal(totalFromApi);
        } else {
          // If API doesn't provide total, use the count from loaded orders as fallback
          setCustomerOrdersTotal(res.orders?.data?.length || 0);
        }
        setCustomerPersona(res.persona?.persona ?? null);
      } catch (err) {
        console.error('Error loading customer details:', err);
        setCustomerDetails(null);
        setCustomerOrders([]);
        setCustomerOrdersTotal(null);
        setCustomerPersona(null);
      } finally {
        setLoadingDetails(false);
      }
    };
    
    loadDetails();
  }, [selCustomer?.MaTheKHTT, dbOn]);

  // Load AI analysis when customer is selected
  useEffect(() => {
    if (!selCustomer || !selCustomer.phone || !dbOn) {
      setAiAnalysis(null);
      setAiAnalysisError(null);
      return;
    }
    
    const loadAiAnalysis = async () => {
      setLoadingAiAnalysis(true);
      setAiAnalysisError(null);
      try {
        // First, get unified customer data
        const customerDataRes = await dbApi.getCustomerByPhone(selCustomer.phone);
        
        if (!customerDataRes.success || !customerDataRes.customer) {
          throw new Error('Không thể lấy dữ liệu khách hàng');
        }
        
        // Then, call AI analysis
        const analysisRes = await aiApi.analyzeCustomer(selCustomer.phone, customerDataRes.customer);
        
        if (analysisRes.success) {
          setAiAnalysis(analysisRes.analysis);
        } else {
          throw new Error(analysisRes.error || 'Lỗi khi phân tích');
        }
      } catch (err) {
        console.error('Error loading AI analysis:', err);
        setAiAnalysisError(err.message || 'Lỗi khi phân tích khách hàng bằng AI');
        setAiAnalysis(null);
      } finally {
        setLoadingAiAnalysis(false);
      }
    };
    
    loadAiAnalysis();
  }, [selCustomer?.phone, dbOn]);
  
  const customers = useMemo(() => {
    if (dbOn && apiData?.data) {
      return apiData.data.map(c => {
        // Format date từ TIMESTAMP sang YYYY-MM-DD
        const formatDate = (ts) => {
          if (!ts) return '';
          if (typeof ts === 'string') {
            return ts.split('T')[0] || ts.split(' ')[0] || ts;
          }
          return ts;
        };
        
        // Tính segment dựa trên RFM
        const totalSpent = Number(c.total_spent || 0);
        const totalOrders = Number(c.total_orders || 0);
        const freq = Number(c.frequency_month || 0);
        const lastPurchase = c.last_purchase ? new Date(c.last_purchase) : null;
        const daysSince = lastPurchase ? Math.floor((new Date() - lastPurchase) / 864e5) : 999;

        const rScore = daysSince <= 7 ? 5 : daysSince <= 30 ? 4 : daysSince <= 60 ? 3 : daysSince <= 120 ? 2 : 1;
        const fScore = freq >= 4 ? 5 : freq >= 2.5 ? 4 : freq >= 1.5 ? 3 : freq >= 0.8 ? 2 : 1;
        const mScore = totalSpent >= 50e6 ? 5 : totalSpent >= 20e6 ? 4 : totalSpent >= 10e6 ? 3 : totalSpent >= 5e6 ? 2 : 1;
        const totalRFM = rScore + fScore + mScore;
        const segment =
          totalRFM >= 13 ? 'Champions'
          : totalRFM >= 10 ? 'Loyal'
          : totalRFM >= 7 ? 'Potential'
          : totalRFM >= 5 ? 'At Risk'
          : 'Hibernating';
        
        return {
          id: c.MaTheKHTT,
          name: c.name || '',
          phone: c.phone || '',
          MaTheKHTT: c.MaTheKHTT || '',
          loyalty_tier: c.loyalty_tier || 'Silver',
          loyalty_points: 0, // Không có trong bảng, có thể tính từ total_spent
          total_spent: totalSpent,
          total_orders: totalOrders,
          last_purchase: formatDate(c.last_purchase),
          first_purchase: formatDate(c.first_purchase),
          avg_basket: Number(c.avg_basket || 0),
          frequency_month: freq,
          top_categories: [], // Sẽ được map từ customerDetails khi có
          top_products: [], // Sẽ được map từ customerDetails khi có
          segment,
          store_primary: c.store_primary || '',
          transaction_stores: [], // Sẽ được map từ customerDetails khi có
          has_zalo: false, // Không có trong bảng
          zalo_oa_follow: false, // Không có trong bảng
          persona: {}
        };
      });
    }
    return demoData?.customers || [];
  }, [dbOn, apiData, demoData]);

  const allStoresList = useMemo(() => [...new Set(customers.map(c => c.store_primary).filter(Boolean))], [customers]);
  const allTiersList = useMemo(() => [...new Set(customers.map(c => c.loyalty_tier).filter(Boolean))], [customers]);
  const allSegsList = useMemo(() => [...new Set(customers.map(c => c.segment).filter(Boolean))], [customers]);

  const filteredCust = useMemo(() => {
    let list = customers;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.MaTheKHTT.toLowerCase().includes(q) || 
        c.phone.includes(q)
      );
    }
    if (custStore !== 'all') list = list.filter(c => c.store_primary === custStore);
    if (custTier !== 'all') list = list.filter(c => c.loyalty_tier === custTier);
    if (custSegment !== 'all') list = list.filter(c => c.segment === custSegment);
    if (custSpendMin) list = list.filter(c => c.total_spent >= Number(custSpendMin));
    if (custSpendMax) list = list.filter(c => c.total_spent <= Number(custSpendMax));
    if (custLastFrom) list = list.filter(c => c.last_purchase >= custLastFrom);
    if (custLastTo) list = list.filter(c => c.last_purchase <= custLastTo);
    
    const s = [...list];
    switch (custSort) {
      case 'total_spent_desc': s.sort((a, b) => b.total_spent - a.total_spent); break;
      case 'total_spent_asc': s.sort((a, b) => a.total_spent - b.total_spent); break;
      case 'last_purchase_desc': s.sort((a, b) => b.last_purchase.localeCompare(a.last_purchase)); break;
      case 'last_purchase_asc': s.sort((a, b) => a.last_purchase.localeCompare(b.last_purchase)); break;
      case 'orders_desc': s.sort((a, b) => b.total_orders - a.total_orders); break;
      case 'freq_desc': s.sort((a, b) => b.frequency_month - a.frequency_month); break;
      default: break;
    }
    return s;
  }, [customers, searchQ, custStore, custTier, custSegment, custSpendMin, custSpendMax, custLastFrom, custLastTo, custSort]);

  const totalFiltered = filteredCust.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const paginatedCust = useMemo(
    () => filteredCust.slice((page - 1) * pageSize, page * pageSize),
    [filteredCust, page, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [searchQ, custStore, custTier, custSegment, custSpendMin, custSpendMax, custLastFrom, custLastTo, custSort]);

  const resetCustFilter = () => {
    setCustStore('all');
    setCustTier('all');
    setCustSegment('all');
    setCustSpendMin('');
    setCustSpendMax('');
    setCustLastFrom('');
    setCustLastTo('');
    setCustSort('total_spent_desc');
    setSearchQ('');
    setPage(1);
  };

  const hasActiveFilter = custStore !== 'all' || custTier !== 'all' || custSegment !== 'all' || custSpendMin || custSpendMax || custLastFrom || custLastTo;

  const selOrders = dbOn
    ? (customerOrders || [])
    : (selCustomer ? (DEMO_ORDERS[selCustomer.id] || []) : []);
  // Use customerOrdersTotal from API if available (set from API response)
  // Fallback to enrichedCustomer.total_orders (from customer list) if API hasn't loaded yet
  // This ensures consistency with the KPI row display
  const filteredOrders = useMemo(() => {
    return selOrders.filter(o => {
      if (orderDateFrom && o.date < orderDateFrom) return false;
      if (orderDateTo && o.date > orderDateTo) return false;
      if (orderStore !== 'all' && (o.store || '').trim() !== orderStore) return false;
      return true;
    }).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [selOrders, orderDateFrom, orderDateTo, orderStore]);

  const orderStoresList = useMemo(() => {
    const stores = [...new Set(selOrders.map(o => (o.store || '').trim()).filter(Boolean))];
    return stores.sort((a, b) => a.localeCompare(b));
  }, [selOrders]);

  const hasOrderFilter = orderDateFrom || orderDateTo || orderStore !== 'all';

  const enrichedCustomer = selCustomer
    ? (() => {
        if (!dbOn || !customerDetails) {
          return customerPersona
            ? { ...selCustomer, persona: customerPersona }
            : selCustomer;
        }
        const mappedDetails = {
          top_categories: customerDetails.categories || selCustomer.top_categories || [],
          top_products: customerDetails.products || selCustomer.top_products || [],
          transaction_stores: customerDetails.stores || selCustomer.transaction_stores || []
        };
        // Get total orders from API response if available
        const totalOrdersFromApi = customerDetails.total_orders || selCustomer.total_orders;
        return {
          ...selCustomer,
          ...mappedDetails,
          persona: customerPersona || selCustomer.persona || {}
        };
      })()
    : null;

  // Use customerOrdersTotal from API if available, but prioritize enrichedCustomer.total_orders for consistency
  // KPI row shows enrichedCustomer.total_orders (1260), so we should use the same value here
  // Only use customerOrdersTotal if it's significantly different (likely more accurate from transaction table)
  // Otherwise, use enrichedCustomer.total_orders to match KPI row display
  const totalOrdersCount = dbOn 
    ? (customerOrdersTotal !== null && customerOrdersTotal > (enrichedCustomer?.total_orders || 0) 
        ? customerOrdersTotal 
        : (enrichedCustomer?.total_orders || selOrders.length))
    : selOrders.length;

  const selRFM = enrichedCustomer ? (() => {
    const c = enrichedCustomer;
    const daysSince = Math.floor((new Date() - new Date(c.last_purchase)) / 864e5);
    const rScore = daysSince <= 7 ? 5 : daysSince <= 30 ? 4 : daysSince <= 60 ? 3 : daysSince <= 120 ? 2 : 1;
    const fScore = c.frequency_month >= 4 ? 5 : c.frequency_month >= 2.5 ? 4 : c.frequency_month >= 1.5 ? 3 : c.frequency_month >= 0.8 ? 2 : 1;
    const mScore = c.total_spent >= 50e6 ? 5 : c.total_spent >= 20e6 ? 4 : c.total_spent >= 10e6 ? 3 : c.total_spent >= 5e6 ? 2 : 1;
    const total = rScore + fScore + mScore;
    const label = total >= 13 ? 'Champions' : total >= 10 ? 'Loyal' : total >= 7 ? 'Potential' : total >= 5 ? 'At Risk' : 'Hibernating';
    const color = total >= 13 ? T.success : total >= 10 ? T.info : total >= 7 ? T.warning : total >= 5 ? T.danger : T.textMuted;
    return { daysSince, rScore, fScore, mScore, total, label, color };
  })() : { daysSince: 0, rScore: 0, fScore: 0, mScore: 0, total: 0, label: '—', color: T.textMuted };

  if (dbOn && loading) {
    return (
      <div className="fu" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
        <div className="spin" />
        <span style={{ marginLeft: 12, color: T.textSec }}>Đang tải dữ liệu từ database...</span>
      </div>
    );
  }

  if (dbOn && error) {
    return (
      <div className="fu card" style={{ padding: 24, textAlign: 'center' }}>
        <div style={{ color: T.danger, marginBottom: 8 }}>Không tải được dữ liệu</div>
        <div style={{ fontSize: 12, color: T.textSec }}>{error}</div>
      </div>
    );
  }

  return (
    <div className="fu">
      <div className="card" style={{ marginBottom: 14 }}>
        {/* Search + Filter Toggle + Export */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: isMobile ? '100%' : 0, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderRadius: 8, background: T.surface, border: `1px solid ${T.cardBorder}` }}>
            <Icon d={ic.search} s={14} c={T.textMuted} />
            <input
              className="inp"
              style={{ border: 'none', background: 'transparent', padding: '8px 0' }}
              placeholder="Tìm MaTheKHTT, tên, SĐT..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
          </div>
          <button
            className={`btn btn-sm ${custShowFilter || hasActiveFilter ? 'btn-p' : 'btn-g'}`}
            onClick={() => setCustShowFilter(!custShowFilter)}
          >
            <Icon d={ic.filter} s={12} /> Lọc {hasActiveFilter ? `(${filteredCust.length})` : ''}
          </button>
          <ExportBtn
            canExport={canExport}
            data={filteredCust.map(c => ({
              MaTheKHTT: c.MaTheKHTT,
              Ten: c.name,
              SoDienThoai: c.phone,
              HangLoyalty: c.loyalty_tier,
              TongChiTieu: c.total_spent,
              SoDonHang: c.total_orders,
              TanSuat: c.frequency_month,
              AOV: c.avg_basket,
              Segment: c.segment,
              CuaHang: c.store_primary,
              LanMuaCuoi: c.last_purchase,
              CoZalo: c.has_zalo ? 'Có' : 'Không'
            }))}
            filename={`KH360_${filteredCust.length}kh`}
          />
        </div>

        {/* Advanced Filter Panel */}
        {custShowFilter && (
          <div style={{ padding: 14, marginBottom: 12, borderRadius: 10, background: T.surfaceAlt, border: `1px solid ${T.cardBorder}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>Bộ lọc nâng cao</span>
              <button className="btn btn-g btn-sm" onClick={resetCustFilter} style={{ padding: '3px 10px', fontSize: 10 }}>
                <Icon d={ic.x} s={10} /> Xoá lọc
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <span className="label-sm">Cửa hàng giao dịch</span>
                <select className="inp" value={custStore} onChange={e => setCustStore(e.target.value)}>
                  <option value="all">Tất cả</option>
                  {allStoresList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <span className="label-sm">Hạng Loyalty</span>
                <select className="inp" value={custTier} onChange={e => setCustTier(e.target.value)}>
                  <option value="all">Tất cả</option>
                  {allTiersList.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <span className="label-sm">Segment</span>
                <select className="inp" value={custSegment} onChange={e => setCustSegment(e.target.value)}>
                  <option value="all">Tất cả</option>
                  {allSegsList.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <span className="label-sm">Sắp xếp</span>
                <select className="inp" value={custSort} onChange={e => setCustSort(e.target.value)}>
                  <option value="total_spent_desc">Chi tiêu cao - thấp</option>
                  <option value="total_spent_asc">Chi tiêu thấp - cao</option>
                  <option value="last_purchase_desc">Mua gần nhất</option>
                  <option value="last_purchase_asc">Lâu chưa mua</option>
                  <option value="orders_desc">Nhiều đơn nhất</option>
                  <option value="freq_desc">Tần suất cao nhất</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 10 }}>
              <div>
                <span className="label-sm">Tổng chi tiêu (VNĐ)</span>
                <div className="range-row">
                  <input className="inp" placeholder="Từ" value={custSpendMin} onChange={e => setCustSpendMin(e.target.value)} />
                  <span style={{ color: T.textMuted }}>—</span>
                  <input className="inp" placeholder="Đến" value={custSpendMax} onChange={e => setCustSpendMax(e.target.value)} />
                </div>
              </div>
              <div>
                <span className="label-sm">Lần giao dịch gần nhất</span>
                <div className="range-row">
                  <input type="date" className="inp" style={{ fontSize: 12 }} value={custLastFrom} onChange={e => setCustLastFrom(e.target.value)} />
                  <span style={{ color: T.textMuted }}>—</span>
                  <input type="date" className="inp" style={{ fontSize: 12 }} value={custLastTo} onChange={e => setCustLastTo(e.target.value)} />
                </div>
              </div>
            </div>
            {hasActiveFilter && (
              <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {custStore !== 'all' && <span className="badge" style={{ background: T.accent + '18', color: T.accent }}>{custStore} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setCustStore('all')}>x</span></span>}
                {custTier !== 'all' && <span className="badge" style={{ background: T.accent + '18', color: T.accent }}>{custTier} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setCustTier('all')}>x</span></span>}
                {custSegment !== 'all' && <span className="badge" style={{ background: T.accent + '18', color: T.accent }}>{custSegment} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setCustSegment('all')}>x</span></span>}
                {custSpendMin && <span className="badge" style={{ background: T.info + '18', color: T.info }}>{`>=${formatValue(+custSpendMin)}`} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setCustSpendMin('')}>x</span></span>}
                {custSpendMax && <span className="badge" style={{ background: T.info + '18', color: T.info }}>{`<=${formatValue(+custSpendMax)}`} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setCustSpendMax('')}>x</span></span>}
                {custLastFrom && <span className="badge" style={{ background: T.success + '18', color: T.success }}>{`Từ ${custLastFrom}`} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setCustLastFrom('')}>x</span></span>}
                {custLastTo && <span className="badge" style={{ background: T.success + '18', color: T.success }}>{`Đến ${custLastTo}`} <span style={{ cursor: 'pointer', marginLeft: 4 }} onClick={() => setCustLastTo('')}>x</span></span>}
              </div>
            )}
          </div>
        )}

        {/* Result count + page size */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 11, color: T.textSec }}>
            Hiển thị {totalFiltered ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalFiltered)}` : '0–0'} / {totalFiltered} khách hàng
            {customers.length !== totalFiltered && ` (tổng ${customers.length})`}
          </span>
          <select
            className="inp"
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
            style={{ width: 70, fontSize: 11, padding: '4px 6px' }}
          >
            {[20, 50, 100, 200].map(n => <option key={n} value={n}>{n}/trang</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="tw">
          <table className="customers-table" style={{ minWidth: isMobile ? 720 : 0 }}>
            <thead>
              <tr>
                {['Mã KH', 'Tên', 'Cửa hàng', 'Hạng', 'Chi tiêu', 'Đơn', 'Mua cuối', 'Tần suất', 'Segment', 'Zalo'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedCust.map(c => (
                <tr
                  key={c.id}
                  className="rh"
                  onClick={() => {
                    setSelCustomer(c);
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                    if (addLog) addLog('view', 'customers', `Xem chi tiết ${c.MaTheKHTT} ${c.name}`);
                  }}
                >
                  <td style={{ color: T.accent, fontWeight: 600 }}>{c.MaTheKHTT}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td style={{ fontSize: 11, color: T.textSec }}>{c.store_primary}</td>
                  <td><Tier t={c.loyalty_tier} /></td>
                  <td style={{ fontWeight: 700, fontSize: 12 }}>{formatValue(c.total_spent)}</td>
                  <td>{c.total_orders}</td>
                  <td style={{ fontSize: 11, color: T.textSec }}>{c.last_purchase}</td>
                  <td style={{ color: T.info, fontWeight: 600 }}>{c.frequency_month}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: (c.segment === 'Champions' ? T.success : c.segment === 'At Risk' || c.segment === 'Hibernating' ? T.danger : T.info) + '18',
                        color: c.segment === 'Champions' ? T.success : c.segment === 'At Risk' || c.segment === 'Hibernating' ? T.danger : T.info,
                        fontSize: 10
                      }}
                    >
                      {c.segment}
                    </span>
                  </td>
                  <td>{c.has_zalo ? <Icon d={ic.check} s={13} c={T.success} /> : <Icon d={ic.x} s={13} c={T.textMuted} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <button
              className="btn btn-g btn-sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              <Icon d={ic.chevronLeft} s={14} /> Trước
            </button>
            <span style={{ fontSize: 12, color: T.textSec }}>
              Trang {page} / {totalPages}
            </span>
            <button
              className="btn btn-g btn-sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Sau <Icon d={ic.chevronRight} s={14} />
            </button>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {enrichedCustomer && (
        <div className="modal-backdrop" onClick={() => {
          setSelCustomer(null);
          setDetailTab('overview');
          setExpandedOrder(null);
          setOrderDateFrom('');
          setOrderDateTo('');
          setOrderStore('all');
        }}>
          <div
            className="card fu modal-card"
            style={{ borderColor: T.accent + '40' }}
            onClick={e => e.stopPropagation()}
          >
          {/* Customer Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, padding: '0 2px', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: isMobile ? 10 : 0 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `linear-gradient(135deg,${T.accent}30,${T.purple}30)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 800,
                  color: T.accent
                }}
              >
                {enrichedCustomer.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Be Vietnam Pro',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>{enrichedCustomer.name}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
                  <span style={{ fontSize: 12, color: T.accent, fontWeight: 600 }}>{enrichedCustomer.MaTheKHTT}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: T.textMuted }} />
                  <span style={{ fontSize: 12, color: T.textSec }}>{enrichedCustomer.phone}</span>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: T.textMuted }} />
                  <span style={{ fontSize: 12, color: T.textSec }}>{enrichedCustomer.store_primary}</span>
                  <Tier t={enrichedCustomer.loyalty_tier} />
                </div>
              </div>
            </div>
            <button
              className="btn btn-g btn-sm"
              onClick={() => {
                setSelCustomer(null);
                setDetailTab('overview');
                setExpandedOrder(null);
                setOrderDateFrom('');
                setOrderDateTo('');
                setOrderStore('all');
              }}
            >
              <Icon d={ic.x} s={12} />
            </button>
          </div>

          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)', gap: 8, marginBottom: 16 }}>
            {[
              { l: 'Tổng chi', v: formatValue(enrichedCustomer.total_spent), c: T.accent, ic2: ic.dollar },
              { l: 'Đơn hàng', v: enrichedCustomer.total_orders, c: T.info, ic2: ic.cart },
              { l: 'Mua cuối', v: enrichedCustomer.last_purchase, c: T.success, ic2: ic.clock },
              { l: 'Tần suất/T', v: enrichedCustomer.frequency_month, c: T.warning, ic2: ic.repeat },
              { l: 'AOV', v: formatValue(enrichedCustomer.avg_basket), c: T.purple, ic2: ic.trend },
              { l: 'Points', v: formatNumber(enrichedCustomer.loyalty_points), c: T.pink, ic2: ic.star }
            ].map((m, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: m.c + '08', border: `1px solid ${m.c}20` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Icon d={m.ic2} s={10} c={m.c} />
                  <span style={{ fontSize: 9, fontWeight: 700, color: m.c, textTransform: 'uppercase', letterSpacing: '.04em' }}>{m.l}</span>
                </div>
                <div className="counter" style={{ fontSize: 16 }}>{m.v}</div>
              </div>
            ))}
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: `1px solid ${T.cardBorder}` }}>
            {[
              { id: 'overview', label: 'Tổng quan', icon: ic.eye },
              { id: 'persona', label: 'Chân dung KH', icon: ic.users },
              { id: 'orders', label: `Lịch sử đơn (${totalOrdersCount})`, icon: ic.cart },
              { id: 'ai-analysis', label: 'AI Phân tích', icon: ic.sparkle }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setDetailTab(t.id);
                  setExpandedOrder(null);
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: 12,
                  fontWeight: detailTab === t.id ? 700 : 500,
                  color: detailTab === t.id ? T.accent : T.textSec,
                  background: detailTab === t.id ? T.accent + '10' : 'transparent',
                  border: 'none',
                  borderBottom: detailTab === t.id ? `2px solid ${T.accent}` : '2px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  borderRadius: '6px 6px 0 0'
                }}
              >
                <Icon d={t.icon} s={12} c={detailTab === t.id ? T.accent : T.textMuted} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content: loading state hoặc nội dung tab */}
          {loadingDetails ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160, gap: 12 }}>
              <div className="spin" />
              <span style={{ color: T.textSec, fontSize: 13 }}>Đang tải dữ liệu...</span>
            </div>
          ) : (
            <>
          {detailTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon d={ic.package} s={13} c={T.accent} /> Top danh mục
                  </div>
                  {(enrichedCustomer.top_categories || []).map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: CL[i] }} />
                      <span style={{ fontSize: 12 }}>{c}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon d={ic.star} s={13} c={T.success} /> Top sản phẩm
                  </div>
                  {(enrichedCustomer.top_products || []).map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                      <span
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 5,
                          background: CL[i] + '15',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 800,
                          color: CL[i]
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: 12 }}>{p}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Icon d={ic.map} s={13} c={T.info} /> Cửa hàng giao dịch
                  </div>
                  {(enrichedCustomer.transaction_stores || []).map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                      <Icon d={ic.map} s={11} c={T.textMuted} />
                      <span style={{ fontSize: 12 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <span className="badge" style={{ background: T.success + '18', color: T.success }}>{enrichedCustomer.segment}</span>
                {enrichedCustomer.has_zalo && (
                  <span className="badge" style={{ background: T.zaloGreen + '18', color: T.zaloGreen }}>
                    Zalo {enrichedCustomer.zalo_oa_follow ? '+ Follow OA' : ''}
                  </span>
                )}
                <span className="badge" style={{ background: T.info + '18', color: T.info }}>KH từ {enrichedCustomer.first_purchase}</span>
              </div>
            </div>
          )}

          {/* Tab: Chân dung KH */}
          {detailTab === 'persona' && enrichedCustomer && (
            <div>
              {/* RFM Section */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon d={ic.bar} s={14} c={selRFM.color} /> RFM Analysis
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { label: 'R - Recency', sub: `${selRFM.daysSince} ngày trước`, score: selRFM.rScore, color: T.success },
                      { label: 'F - Frequency', sub: `${enrichedCustomer.frequency_month}/tháng`, score: selRFM.fScore, color: T.info },
                      { label: 'M - Monetary', sub: formatValue(enrichedCustomer.total_spent), score: selRFM.mScore, color: T.accent }
                    ].map((r, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div>
                            <span style={{ fontSize: 12, fontWeight: 700 }}>{r.label}</span>
                            <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 8 }}>{r.sub}</span>
                          </div>
                          <span style={{ fontSize: 14, fontWeight: 800, color: r.color }}>{r.score}/5</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: T.cardBorder, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(r.score / 5 * 100)}%`, background: r.color, borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: selRFM.color + '10', border: `1px solid ${selRFM.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: 11, color: T.textSec }}>RFM Score</span>
                      <div style={{ fontSize: 22, fontWeight: 800, color: selRFM.color }}>{selRFM.total}/15</div>
                    </div>
                    <span className="badge" style={{ background: selRFM.color + '20', color: selRFM.color, fontSize: 13, fontWeight: 700, padding: '6px 14px' }}>
                      {selRFM.label}
                    </span>
                  </div>
                </div>

                {/* Value & Lifecycle */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon d={ic.target} s={14} c={T.purple} /> Phân loại giá trị
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                    {[
                      {
                        label: 'Value Segment',
                        value: (enrichedCustomer.persona || {}).value_seg,
                        colorMap: { 'Super VIP': T.accent, 'VIP': T.success, 'Regular': T.info, 'Low': T.textMuted }
                      },
                      {
                        label: 'Lifecycle',
                        value: (enrichedCustomer.persona || {}).lifecycle,
                        colorMap: { 'Loyal': T.success, 'Active': T.info, 'Growing': T.warning, 'Declining': T.danger, 'Churning': T.textMuted }
                      }
                    ].map((d, i) => {
                      const cl = d.colorMap[d.value] || T.info;
                      return (
                        <div key={i} style={{ padding: 10, borderRadius: 10, background: cl + '10', border: `1px solid ${cl}25` }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: cl, textTransform: 'uppercase', marginBottom: 3 }}>{d.label}</div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: cl }}>{d.value || '—'}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'AOV Level', value: (enrichedCustomer.persona || {}).aov_level },
                      { label: 'Frequency', value: (enrichedCustomer.persona || {}).freq_level }
                    ].map((d, i) => (
                      <div key={i} style={{ padding: 8, borderRadius: 8, background: T.surfaceAlt }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, marginBottom: 2 }}>{d.label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{d.value || '—'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Persona Dimensions */}
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon d={ic.users} s={14} c={T.accent} /> Customer Persona
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  {
                    label: 'Product Persona',
                    value: ((enrichedCustomer.persona || {}).product_persona || []).join(', '),
                    icon: ic.package,
                    color: T.accent
                  },
                  {
                    label: 'Payment Persona',
                    value: (enrichedCustomer.persona || {}).payment_persona,
                    icon: ic.dollar,
                    color: T.info
                  },
                  {
                    label: 'Price Sensitivity',
                    value: (enrichedCustomer.persona || {}).price_sens,
                    icon: ic.star,
                    color: T.warning
                  },
                  {
                    label: 'Shopping Mission',
                    value: (enrichedCustomer.persona || {}).shop_mission,
                    icon: ic.cart,
                    color: T.success
                  },
                  {
                    label: 'Channel',
                    value: (enrichedCustomer.persona || {}).channel,
                    icon: ic.msg,
                    color: T.purple
                  },
                  {
                    label: 'Store',
                    value: enrichedCustomer.store_primary,
                    icon: ic.map,
                    color: T.teal
                  }
                ].map((d, i) => (
                  <div key={i} style={{ padding: 10, borderRadius: 10, background: T.surfaceAlt, border: `1px solid ${T.cardBorder}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
                      <Icon d={d.icon} s={11} c={d.color} />
                      <span style={{ fontSize: 9, fontWeight: 700, color: d.color, textTransform: 'uppercase' }}>{d.label}</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{d.value || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {(enrichedCustomer.persona || {}).note && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: `linear-gradient(135deg,${T.card} 0%,#1a1828 100%)`,
                    border: `1px solid ${T.purple}20`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <Icon d={ic.edit} s={12} c={T.purple} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.purple }}>Ghi chú</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6 }}>
                    {(enrichedCustomer.persona || {}).note}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Orders */}
          {detailTab === 'orders' && (
            <div>
              {/* Order filter bar */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
                <Icon d={ic.filter} s={13} c={T.textMuted} />
                <input type="date" className="inp" style={{ maxWidth: 140, fontSize: 11 }} value={orderDateFrom} onChange={e => setOrderDateFrom(e.target.value)} />
                <span style={{ color: T.textMuted, fontSize: 11 }}>đến</span>
                <input type="date" className="inp" style={{ maxWidth: 140, fontSize: 11 }} value={orderDateTo} onChange={e => setOrderDateTo(e.target.value)} />
                <select className="inp" style={{ maxWidth: 200, fontSize: 11 }} value={orderStore} onChange={e => setOrderStore(e.target.value)}>
                  <option value="all">Tất cả cửa hàng</option>
                  {orderStoresList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span style={{ fontSize: 11, color: T.textMuted }}>
                  {filteredOrders.length}/{totalOrdersCount} đơn
                </span>
                {hasOrderFilter && (
                  <button
                    className="btn btn-g btn-sm"
                    style={{ fontSize: 10, padding: '4px 10px' }}
                    onClick={() => {
                      setOrderDateFrom('');
                      setOrderDateTo('');
                      setOrderStore('all');
                    }}
                  >
                    <Icon d={ic.x} s={10} /> Xoá lọc
                  </button>
                )}
              </div>

              {/* Orders list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filteredOrders.length === 0 && (
                  <div style={{ padding: 24, textAlign: 'center', color: T.textMuted, fontSize: 13 }}>
                    {totalOrdersCount === 0
                      ? 'Không có đơn hàng'
                      : hasOrderFilter
                        ? 'Không có đơn hàng phù hợp với bộ lọc. Thử đổi khoảng ngày hoặc cửa hàng.'
                        : 'Không có đơn hàng'}
                  </div>
                )}
                {filteredOrders.map(o => {
                  const isExp = expandedOrder === o.id;
                  const isCx = o.status === 'cancelled';
                  return (
                    <div key={o.id} style={{ borderRadius: 10, border: `1px solid ${isExp ? T.accent + '40' : T.cardBorder}`, background: isExp ? T.accent + '05' : T.surface, overflow: 'hidden' }}>
                      {/* Order row */}
                      <div onClick={() => setExpandedOrder(isExp ? null : o.id)} style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: isCx ? T.danger + '15' : T.success + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon d={isCx ? ic.x : ic.check} s={13} c={isCx ? T.danger : T.success} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>{o.id}</span>
                            <span style={{ fontSize: 11, color: T.textSec }}>{o.date}</span>
                            {isCx && <span className="badge" style={{ background: T.danger + '18', color: T.danger, fontSize: 9 }}>Đã huỷ</span>}
                          </div>
                          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{o.store} · {o.pay} · {o.items.length} SP</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div className="counter" style={{ fontSize: 14, textDecoration: isCx ? 'line-through' : 'none' }}>{formatValue(o.total)}</div>
                          {o.disc > 0 && <div style={{ fontSize: 10, color: T.success }}>-{formatValue(o.disc)}</div>}
                        </div>
                        <Icon d={isExp ? ic.chevronUp : ic.chevronDown} s={14} c={T.textMuted} />
                      </div>

                      {/* Expanded: Order items */}
                      {isExp && (
                        <div style={{ borderTop: `1px solid ${T.cardBorder}`, padding: '12px 14px', background: T.bg + '80', overflowX: 'auto' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '80px minmax(0,1.5fr) 80px 40px minmax(0,120px) 90px', gap: 4, marginBottom: 6, padding: '0 4px', minWidth: 640 }}>
                            {['SKU', 'Sản phẩm', 'Đơn giá', 'SL', 'Danh mục', 'Thành tiền'].map(h => (
                              <span key={h} style={{ fontSize: 9, color: T.textMuted, fontWeight: 700, textAlign: h === 'Đơn giá' || h === 'Thành tiền' ? 'right' : h === 'SL' ? 'center' : 'left' }}>
                                {h}
                              </span>
                            ))}
                          </div>
                          {o.items.map((it, j) => (
                            <div key={j} style={{ display: 'grid', gridTemplateColumns: '80px minmax(0,1.5fr) 80px 40px minmax(0,120px) 90px', gap: 4, padding: '6px 4px', borderRadius: 6, background: j % 2 === 0 ? 'transparent' : T.surfaceAlt + '50', alignItems: 'center', minWidth: 640 }}>
                              <span style={{ fontSize: 10, color: T.textMuted, whiteSpace: 'nowrap' }}>{it.sku}</span>
                              <span style={{ fontSize: 12, fontWeight: 600, minWidth: 0 }}>{it.name}</span>
                              <span style={{ fontSize: 11, color: T.textSec, textAlign: 'right' }}>{formatValue(it.price)}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: T.info, textAlign: 'center' }}>{it.qty}</span>
                              <span style={{ fontSize: 10, color: T.textMuted }}>{it.cat}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>{formatValue(it.amt)}</span>
                            </div>
                          ))}
                          <div style={{ borderTop: `1px solid ${T.cardBorder}`, marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 20 }}>
                            <span style={{ fontSize: 11, color: T.textSec }}>Tạm tính: <b style={{ color: T.text }}>{formatValue(o.sub)}</b></span>
                            {o.disc > 0 && <span style={{ fontSize: 11, color: T.success }}>Giảm: <b>-{formatValue(o.disc)}</b></span>}
                            <span style={{ fontSize: 12, fontWeight: 800, color: T.accent }}>Tổng: {formatValue(o.total)}</span>
                            <span style={{ fontSize: 11, color: T.purple }}>+{o.pts} pts</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab: AI Analysis */}
          {detailTab === 'ai-analysis' && (
            <div>
              {loadingAiAnalysis && (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <div className="spin" style={{ width: 32, height: 32, margin: '0 auto 16px', borderWidth: 3 }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.accent, marginBottom: 4 }}>AI đang phân tích khách hàng...</div>
                  <div style={{ fontSize: 11, color: T.textSec }}>Đang tổng hợp insights và đề xuất</div>
                </div>
              )}

              {aiAnalysisError && (
                <div style={{ padding: 20, borderRadius: 10, background: T.danger + '15', border: `1px solid ${T.danger}30` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Icon d={ic.alert} s={16} c={T.danger} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.danger }}>Lỗi khi phân tích</div>
                  </div>
                  <div style={{ fontSize: 12, color: T.textSec }}>{aiAnalysisError}</div>
                </div>
              )}

              {!loadingAiAnalysis && !aiAnalysisError && aiAnalysis && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Summary */}
                  {aiAnalysis.summary && (
                    <div style={{ padding: '16px 18px', borderRadius: 12, background: `linear-gradient(135deg,${T.accent}15,${T.purple}15)`, border: `1px solid ${T.accent}25` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <Icon d={ic.sparkle} s={16} c={T.accent} />
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>Tóm tắt</div>
                      </div>
                      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{aiAnalysis.summary}</div>
                    </div>
                  )}

                  {/* Insights */}
                  {aiAnalysis.insights && aiAnalysis.insights.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <Icon d={ic.target} s={14} c={T.info} />
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Insights</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {aiAnalysis.insights.map((insight, i) => {
                          const typeColors = {
                            opportunity: T.success,
                            risk: T.danger,
                            strength: T.accent,
                            warning: T.warning
                          };
                          const color = typeColors[insight.type] || T.info;
                          return (
                            <div
                              key={i}
                              style={{
                                padding: '12px 16px',
                                borderRadius: 10,
                                background: color + '10',
                                border: `1px solid ${color}25`
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <Icon d={insight.type === 'risk' ? ic.alert : insight.type === 'opportunity' ? ic.trend : ic.target} s={12} c={color} />
                                <div style={{ fontSize: 12, fontWeight: 700, color: color, textTransform: 'uppercase' }}>
                                  {insight.type === 'opportunity' ? 'Cơ hội' : insight.type === 'risk' ? 'Rủi ro' : insight.type === 'strength' ? 'Điểm mạnh' : 'Cảnh báo'}
                                </div>
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>{insight.title}</div>
                              <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.5 }}>{insight.description}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <Icon d={ic.check} s={14} c={T.success} />
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Đề xuất</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {aiAnalysis.recommendations.map((rec, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              background: T.success + '08',
                              border: `1px solid ${T.success}20`,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 8
                            }}
                          >
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.success, flexShrink: 0 }}>•</span>
                            <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{rec}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Actions */}
                  {aiAnalysis.next_actions && aiAnalysis.next_actions.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <Icon d={ic.play} s={14} c={T.accent} />
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Hành động tiếp theo</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {aiAnalysis.next_actions.map((action, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '10px 14px',
                              borderRadius: 8,
                              background: T.accent + '08',
                              border: `1px solid ${T.accent}20`,
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 8
                            }}
                          >
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.accent, flexShrink: 0 }}>→</span>
                            <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{action}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Personalized Recommendations */}
                  {aiAnalysis.personalized_recommendations && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <Icon d={ic.cart} s={14} c={T.accent} />
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Gợi ý Sản phẩm Cá nhân Hoá</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {/* Frequently Bought */}
                        {aiAnalysis.personalized_recommendations.frequently_bought && aiAnalysis.personalized_recommendations.frequently_bought.length > 0 && (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>Sản phẩm bạn hay mua</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {aiAnalysis.personalized_recommendations.frequently_bought.map((item, i) => (
                                <div
                                  key={i}
                                  style={{
                                    padding: '10px 14px',
                                    borderRadius: 8,
                                    background: T.accent + '08',
                                    border: `1px solid ${T.accent}20`
                                  }}
                                >
                                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>{item.product}</div>
                                  <div style={{ fontSize: 11, color: T.textSec, lineHeight: 1.4 }}>{item.reason}</div>
                                  {item.last_purchase && (
                                    <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4 }}>Mua cuối: {item.last_purchase}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Today Suggestions */}
                        {aiAnalysis.personalized_recommendations.today_suggestions && aiAnalysis.personalized_recommendations.today_suggestions.length > 0 && (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>Gợi ý hôm nay cho bạn</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {aiAnalysis.personalized_recommendations.today_suggestions.map((item, i) => (
                                <div
                                  key={i}
                                  style={{
                                    padding: '10px 14px',
                                    borderRadius: 8,
                                    background: T.info + '08',
                                    border: `1px solid ${T.info}20`
                                  }}
                                >
                                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>{item.product}</div>
                                  <div style={{ fontSize: 11, color: T.textSec, lineHeight: 1.4 }}>{item.reason}</div>
                                  {item.context && (
                                    <div style={{ fontSize: 10, color: T.info, marginTop: 4, fontStyle: 'italic' }}>{item.context}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Cross-sell */}
                        {aiAnalysis.personalized_recommendations.cross_sell && aiAnalysis.personalized_recommendations.cross_sell.length > 0 && (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>Bạn có thể cần thêm</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {aiAnalysis.personalized_recommendations.cross_sell.map((item, i) => (
                                <div
                                  key={i}
                                  style={{
                                    padding: '10px 14px',
                                    borderRadius: 8,
                                    background: T.success + '08',
                                    border: `1px solid ${T.success}20`
                                  }}
                                >
                                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 4 }}>{item.product}</div>
                                  <div style={{ fontSize: 11, color: T.textSec, lineHeight: 1.4 }}>{item.reason}</div>
                                  {item.complementary_to && (
                                    <div style={{ fontSize: 10, color: T.success, marginTop: 4 }}>Bổ sung cho: {item.complementary_to}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AI-Driven Promotions */}
                  {aiAnalysis.ai_promotions && aiAnalysis.ai_promotions.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <Icon d={ic.gift} s={14} c={T.warning} />
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Chương Trình Khuyến Mãi Tự Động</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {aiAnalysis.ai_promotions.map((promo, i) => {
                          const typeLabels = {
                            cycle_based: 'Chu kỳ mua',
                            churn_prevention: 'Ngăn chặn rời bỏ',
                            segment_based: 'Phân khúc',
                            new_customer: 'Khách hàng mới'
                          };
                          return (
                            <div
                              key={i}
                              style={{
                                padding: '12px 16px',
                                borderRadius: 10,
                                background: T.warning + '10',
                                border: `1px solid ${T.warning}25`
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <Icon d={ic.gift} s={12} c={T.warning} />
                                <div style={{ fontSize: 11, fontWeight: 700, color: T.warning, textTransform: 'uppercase' }}>
                                  {typeLabels[promo.type] || promo.type}
                                </div>
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>{promo.title}</div>
                              <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.5, marginBottom: 6 }}>{promo.description}</div>
                              {promo.trigger && (
                                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>
                                  <span style={{ fontWeight: 600 }}>Kích hoạt:</span> {promo.trigger}
                                </div>
                              )}
                              {promo.suggested_offer && (
                                <div style={{ fontSize: 12, fontWeight: 700, color: T.warning, marginBottom: 4 }}>
                                  Đề xuất: {promo.suggested_offer}
                                </div>
                              )}
                              {promo.channel && (
                                <div style={{ fontSize: 10, color: T.textMuted }}>
                                  Kênh: {promo.channel}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Churn Prevention */}
                  {aiAnalysis.churn_prevention && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <Icon d={ic.shield} s={14} c={T.danger} />
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Dự Đoán Hành Vi & Ngăn Chặn Khách Rời Bỏ</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* Risk Level */}
                        {aiAnalysis.churn_prevention.risk_level && (
                          <div style={{ padding: '12px 16px', borderRadius: 10, background: T.danger + '10', border: `1px solid ${T.danger}25` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                              <Icon d={ic.alert} s={12} c={T.danger} />
                              <div style={{ fontSize: 12, fontWeight: 700, color: T.danger, textTransform: 'uppercase' }}>
                                Mức độ rủi ro: {aiAnalysis.churn_prevention.risk_level === 'high' ? 'CAO' : aiAnalysis.churn_prevention.risk_level === 'medium' ? 'TRUNG BÌNH' : 'THẤP'}
                              </div>
                            </div>
                            {aiAnalysis.churn_prevention.risk_factors && aiAnalysis.churn_prevention.risk_factors.length > 0 && (
                              <div style={{ marginTop: 8 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 6 }}>Yếu tố rủi ro:</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                  {aiAnalysis.churn_prevention.risk_factors.map((factor, i) => (
                                    <div key={i} style={{ fontSize: 11, color: T.textSec, paddingLeft: 12, position: 'relative' }}>
                                      <span style={{ position: 'absolute', left: 0 }}>•</span> {factor}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Prevention Strategy */}
                        {aiAnalysis.churn_prevention.prevention_strategy && aiAnalysis.churn_prevention.prevention_strategy.length > 0 && (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>Chiến lược ngăn chặn</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {aiAnalysis.churn_prevention.prevention_strategy.map((strategy, i) => (
                                <div
                                  key={i}
                                  style={{
                                    padding: '10px 14px',
                                    borderRadius: 8,
                                    background: T.success + '08',
                                    border: `1px solid ${T.success}20`
                                  }}
                                >
                                  <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{strategy}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Next Purchase Prediction */}
                        {aiAnalysis.churn_prevention.next_purchase_prediction && (
                          <div style={{ padding: '12px 16px', borderRadius: 10, background: T.info + '10', border: `1px solid ${T.info}25` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                              <Icon d={ic.clock} s={12} c={T.info} />
                              <div style={{ fontSize: 12, fontWeight: 700, color: T.info }}>Dự đoán mua tiếp theo</div>
                            </div>
                            {aiAnalysis.churn_prevention.next_purchase_prediction.predicted_date && (
                              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                                Ngày dự kiến: {aiAnalysis.churn_prevention.next_purchase_prediction.predicted_date}
                              </div>
                            )}
                            {aiAnalysis.churn_prevention.next_purchase_prediction.confidence && (
                              <div style={{ fontSize: 11, color: T.textSec, marginBottom: 8 }}>
                                Độ tin cậy: {aiAnalysis.churn_prevention.next_purchase_prediction.confidence === 'high' ? 'Cao' : aiAnalysis.churn_prevention.next_purchase_prediction.confidence === 'medium' ? 'Trung bình' : 'Thấp'}
                              </div>
                            )}
                            {aiAnalysis.churn_prevention.next_purchase_prediction.suggested_products && aiAnalysis.churn_prevention.next_purchase_prediction.suggested_products.length > 0 && (
                              <div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: T.text, marginBottom: 4 }}>Sản phẩm đề xuất:</div>
                                <div style={{ fontSize: 11, color: T.textSec }}>
                                  {aiAnalysis.churn_prevention.next_purchase_prediction.suggested_products.join(', ')}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!loadingAiAnalysis && !aiAnalysisError && !aiAnalysis && (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: T.textSec }}>Chưa có dữ liệu phân tích</div>
                </div>
              )}
            </div>
          )}
            </>
          )}
          </div>
        </div>
      )}
    </div>
  );
}
