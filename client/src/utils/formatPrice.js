export const formatPrice = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

export const calcDiscount = (original, sale) =>
  Math.round(((original - sale) / original) * 100);