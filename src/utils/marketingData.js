export function transformMarketingData(dbOn, apiData, error, demoData) {
  const demo = demoData || {};
  const defaultMetrics = { campaigns: 12, reach: '485K', ctr: '3.8%' };
  const defaultCampaigns = [
    { name: 'Flash Sale T12', status: 'Active', objective: 'Sales', spend: '45M', reach: '120K', ctr: '4.2%' },
    { name: 'Loyalty Q4', status: 'Active', objective: 'Retention', spend: '32M', reach: '85K', ctr: '3.5%' },
    { name: 'VIP Exclusive', status: 'Active', objective: 'Upsell', spend: '18M', reach: '15K', ctr: '8.1%' },
    { name: 'Win-back', status: 'Active', objective: 'Retention', spend: '12M', reach: '25K', ctr: '2.8%' }
  ];

  if (dbOn && apiData && !error) {
    const campaigns = (apiData.campaigns || []).map((c) => ({
      name: c.name || '—',
      status: c.status || '—',
      objective: c.objective || '—',
      spend: c.spend || '—',
      reach: c.reach || '—',
      ctr: c.ctr || '—'
    }));
    const useDemoCampaigns = !campaigns.length;
    return {
      metrics: useDemoCampaigns && demo.marketingMetrics
        ? demo.marketingMetrics
        : { campaigns: apiData.metrics?.campaigns ?? 0, reach: apiData.metrics?.reach ?? '0', ctr: apiData.metrics?.ctr ?? '0%' },
      campaigns: useDemoCampaigns ? (demo.campaigns || defaultCampaigns) : campaigns
    };
  }
  return {
    metrics: demo.marketingMetrics || defaultMetrics,
    campaigns: demo.campaigns || defaultCampaigns
  };
}
