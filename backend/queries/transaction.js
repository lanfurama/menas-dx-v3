// Transaction queries for datamart_transaction table

export const getTransactions = (limit, offset) => ({
  text: `SELECT * FROM public.datamart_transaction 
         ORDER BY "NgayGioQuet" DESC NULLS LAST, "MaHD" NULLS LAST 
         LIMIT $1 OFFSET $2`,
  values: [parseInt(limit), parseInt(offset)]
});

export const countTransactions = () => `SELECT COUNT(*) FROM public.datamart_transaction`;
