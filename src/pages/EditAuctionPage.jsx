import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const categories = ['Electronics', 'Gaming', 'Laptops', 'Cameras', 'Collectibles', 'Vehicles']

function EditAuctionPage({ auctions, onAuctionUpdate, addNotification }) {
  const navigate = useNavigate()
  const { id } = useParams()

  const auction = useMemo(() => auctions.find((a) => a.id === id), [auctions, id])

  const getDateAndTimeFromTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const timeStr = `${hours}:${minutes}`
    return { dateStr, timeStr }
  }

  const [form, setForm] = useState(() => {
    if (!auction) return { productName: '', category: '', description: '', startingPrice: '', startDate: '', startTime: '', endDate: '', endTime: '' }

    const { dateStr: startDate, timeStr: startTime } = getDateAndTimeFromTimestamp(auction.startTime)
    const { dateStr: endDate, timeStr: endTime } = getDateAndTimeFromTimestamp(auction.endTime)

    return {
      productName: auction.productName || '',
      category: auction.category || '',
      description: auction.description || '',
      startingPrice: auction.startingPrice?.toString() || '',
      startDate,
      startTime,
      endDate,
      endTime,
    }
  })

  const [image, setImage] = useState(auction?.image || '')
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  const startTimestamp = useMemo(() => new Date(`${form.startDate}T${form.startTime}`).getTime(), [form.startDate, form.startTime])
  const endTimestamp = useMemo(() => new Date(`${form.endDate}T${form.endTime}`).getTime(), [form.endDate, form.endTime])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setMessage('')
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setImage(String(reader.result))
      setErrors((current) => ({ ...current, image: '' }))
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.productName.trim()) nextErrors.productName = 'Product name is required.'
    if (!form.category) nextErrors.category = 'Category is required.'
    if (!form.description.trim()) nextErrors.description = 'Description is required.'
    if (!form.startingPrice || Number(form.startingPrice) <= 0) nextErrors.startingPrice = 'Starting price must be greater than 0.'
    if (!form.startDate) nextErrors.startDate = 'Start date is required.'
    if (!form.startTime) nextErrors.startTime = 'Start time is required.'
    if (!form.endDate) nextErrors.endDate = 'End date is required.'
    if (!form.endTime) nextErrors.endTime = 'End time is required.'
    if (!image) nextErrors.image = 'Product image is required.'

    if (form.startDate && form.startTime && form.endDate && form.endTime && endTimestamp <= startTimestamp) {
      nextErrors.endTime = 'End time must be after start time.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!validate() || !auction) return

    const updatedAuction = {
      ...auction,
      productName: form.productName.trim(),
      description: form.description.trim(),
      category: form.category,
      image,
      startingPrice: Number(form.startingPrice),
      startTime: startTimestamp,
      endTime: endTimestamp,
      status: startTimestamp <= Date.now() ? 'LIVE' : 'UPCOMING',
    }

    onAuctionUpdate(updatedAuction)
    addNotification?.({
      type: 'UPDATED',
      title: 'Auction updated',
      message: `Your auction for ${updatedAuction.productName} has been updated.`,
      link: '/seller/dashboard',
    })
    setMessage('Auction updated successfully.')
    setTimeout(() => navigate('/seller/dashboard'), 800)
  }

  const formatDateTime = (timestamp) => (Number.isNaN(timestamp) ? 'Not set' : new Date(timestamp).toLocaleString())

  if (!auction) {
    return (
      <div className="page-shell container">
        <div className="page-header-block">
          <h1>Auction not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell container">
      <div className="page-header-block create-auction-header">
        <div>
          <span className="eyebrow">Edit your item</span>
          <h1>Edit Auction</h1>
          <p>Update your product details and auction settings.</p>
        </div>
      </div>

      <div className="create-auction-layout">
        <form className="auction-form create-auction-form" onSubmit={handleSubmit} noValidate>
          <section className="form-section">
            <div className="form-section-heading">
              <span className="eyebrow">01</span>
              <h2>Product information</h2>
            </div>

            <div className="field-grid">
              <div className="field">
                <label htmlFor="productName">Product Name</label>
                <input id="productName" name="productName" value={form.productName} onChange={handleChange} />
                {errors.productName && <span className="field-error">{errors.productName}</span>}
              </div>
              <div className="field">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={form.category} onChange={handleChange}>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && <span className="field-error">{errors.category}</span>}
              </div>
              <div className="field full-span">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={form.description} onChange={handleChange} rows="5" />
                {errors.description && <span className="field-error">{errors.description}</span>}
              </div>
              <div className="field">
                <label htmlFor="startingPrice">Starting Price (₹)</label>
                <input id="startingPrice" name="startingPrice" type="number" min="1" value={form.startingPrice} onChange={handleChange} />
                {errors.startingPrice && <span className="field-error">{errors.startingPrice}</span>}
              </div>
              <div className="field full-span">
                <label htmlFor="image">Product Image Upload (or keep existing)</label>
                <input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} />
                {errors.image && <span className="field-error">{errors.image}</span>}
              </div>
            </div>
          </section>

          <section className="form-section">
            <div className="form-section-heading">
              <span className="eyebrow">02</span>
              <h2>Auction settings</h2>
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="startDate">Auction Start Date</label>
                <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
                {errors.startDate && <span className="field-error">{errors.startDate}</span>}
              </div>
              <div className="field">
                <label htmlFor="startTime">Auction Start Time</label>
                <input id="startTime" name="startTime" type="time" value={form.startTime} onChange={handleChange} />
                {errors.startTime && <span className="field-error">{errors.startTime}</span>}
              </div>
              <div className="field">
                <label htmlFor="endDate">Auction End Date</label>
                <input id="endDate" name="endDate" type="date" value={form.endDate} onChange={handleChange} />
                {errors.endDate && <span className="field-error">{errors.endDate}</span>}
              </div>
              <div className="field">
                <label htmlFor="endTime">Auction End Time</label>
                <input id="endTime" name="endTime" type="time" value={form.endTime} onChange={handleChange} />
                {errors.endTime && <span className="field-error">{errors.endTime}</span>}
              </div>
            </div>
          </section>

          {message && <p className="form-success">{message}</p>}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/seller/dashboard')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>

        <aside className="auction-preview-card">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Preview</span>
              <h2>Auction Preview</h2>
            </div>
            <span className={`status-badge ${auction.status.toLowerCase()}`}>{auction.status}</span>
          </div>
          <div className="preview-image-wrap">
            {image ? <img src={image} alt="Product preview" /> : <span>Product image preview</span>}
          </div>
          <div className="preview-copy">
            <span className="auction-category">{form.category || 'Category'}</span>
            <h3>{form.productName || 'Your product name'}</h3>
            <div className="preview-price">
              <span>Starting price</span>
              <strong>{form.startingPrice ? `₹${Number(form.startingPrice).toLocaleString('en-IN')}` : '₹0'}</strong>
            </div>
            <div className="preview-dates">
              <span>Starts: {formatDateTime(startTimestamp)}</span>
              <span>Ends: {formatDateTime(endTimestamp)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default EditAuctionPage
