function StatusBadge({ status }) {
  const normalized = String(status).toUpperCase()

  return (
    <span className={`status-badge ${normalized.toLowerCase()}`}>
      {normalized}
    </span>
  )
}

export default StatusBadge
