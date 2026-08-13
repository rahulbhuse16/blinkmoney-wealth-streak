export function formatINR(amount: number): string {
  if (!Number.isFinite(amount)) return "₹0";
  const rounded = Math.round(amount);
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
  try {
    return formatter.format(rounded);
  } catch {
    // Fallback for environments without full Intl locale data
    return `₹${rounded.toLocaleString()}`;
  }
}

export function formatCompactINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return formatINR(amount);
}

export function pluralize(
  count: number,
  singular: string,
  plural?: string,
): string {
  return count === 1 ? singular : (plural ?? `${singular}s`);
}

export function truncateName(name: string, maxLength = 18): string {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength - 1)}…`;
}
