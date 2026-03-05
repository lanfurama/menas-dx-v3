// Location queries for datamart_localtion table

export const getLocations = (limit, offset) => ({
  text: `SELECT * FROM public.datamart_localtion LIMIT $1 OFFSET $2`,
  values: [parseInt(limit), parseInt(offset)]
});

export const countLocations = () => `SELECT COUNT(*) FROM public.datamart_localtion`;
