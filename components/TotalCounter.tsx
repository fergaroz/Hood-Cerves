export function TotalCounter({
  totalLiters,
  label = "Total del grupo",
}: {
  totalLiters: number;
  label?: string;
}) {
  return (
    <div className="total-banner">
      <span className="label">{label}</span>
      <span className="value">{totalLiters.toFixed(2)} L</span>
    </div>
  );
}
