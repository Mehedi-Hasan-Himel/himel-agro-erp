export function formatCurrency(
  amount: number = 0,
  currencySymbol = "৳"
): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat("en-IN").format(Math.abs(rounded));
  if (rounded < 0) {
    return `-${currencySymbol}${formatted}`;
  }
  return `${currencySymbol}${formatted}`;
}
