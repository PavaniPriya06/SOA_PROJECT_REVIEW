function DashboardCard({ title, value, subtitle, tone = 'default' }) {
  return (
    <div className={`dashboard-card ${tone}`}>
      <p>{title}</p>
      <h3>{value}</h3>
      <span>{subtitle}</span>
    </div>
  )
}

export default DashboardCard
