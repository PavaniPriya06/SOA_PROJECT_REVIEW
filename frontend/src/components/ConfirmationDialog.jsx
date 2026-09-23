function ConfirmationDialog({ isOpen, title, message, onConfirm, onCancel, cancelText = 'Cancel', confirmText = 'Confirm', isDangerous = false }) {
  if (!isOpen) return null

  return (
    <div className="confirmation-dialog-overlay">
      <div className="confirmation-dialog">
        <div className="dialog-header">
          <h2>{title}</h2>
        </div>
        <div className="dialog-body">
          <p>{message}</p>
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog
