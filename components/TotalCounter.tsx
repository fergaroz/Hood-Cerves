export function TotalCounter({ totalLiters }: { totalLiters: number }) {
  return (
    <div className="total-banner">
      <span className="label">Total del grupo</span>
      <span className="value">{totalLiters.toFixed(2)} L</span>
    </div>
  );
}
