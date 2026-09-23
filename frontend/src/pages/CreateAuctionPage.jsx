import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auctionApi } from '../api/auctionApi'

const categories = ['Electronics', 'Gaming', 'Laptops', 'Cameras', 'Collectibles', 'Vehicles']

function CreateAuctionPage({ user, onCreateAuction, addNotification }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    productName: '',
    category: '',
    description: '',
    startingPrice: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  })
  const [image, setImage] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const startTimestamp = useMemo(
    () => new Date(`${form.startDate}T${form.startTime}`).getTime(),
    [form.startDate, form.startTime],
  )
  const endTimestamp = useMemo(
    () => new Date(`${form.endDate}T${form.endTime}`).getTime(),
    [form.endDate, form.endTime],
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setMessage('')
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setImage(URL.createObjectURL(file))
    setErrors((current) => ({ ...current, image: '' }))
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const newAuction = await auctionApi.createAuction({
        productName: form.productName.trim(),
        category: form.category,
        description: form.description.trim(),
        imageFile,
        startingPrice: form.startingPrice,
        startTime: `${form.startDate}T${form.startTime}:00`,
        endTime: `${form.endDate}T${form.endTime}:00`,
        sellerId: user?.id,
      })
      onCreateAuction(newAuction)
      addNotification?.({
        type: 'CREATED',
        title: 'Auction created',
        message: `Your auction for ${newAuction.productName} has been created.`,
        link: '/seller/dashboard',
      })
      navigate('/seller/dashboard')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDateTime = (timestamp) => (Number.isNaN(timestamp) ? 'Not set' : new Date(timestamp).toLocaleString())

  return (
    <div className="page-shell container">
      <div className="page-header-block create-auction-header">
        <div>
          <span className="eyebrow">List your item</span>
          <h1>Create New Auction</h1>
          <p>List your product and start a competitive real-time auction.</p>
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
                  {categories.map((category) => <option key={category}>{category}</option>)}
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
                <label htmlFor="image">Product Image Upload</label>
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
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/seller/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Creating Auction...' : 'Create Auction'}</button>
          </div>
        </form>

        <aside className="auction-preview-card">
          <div className="panel-header">
            <div>
              <span className="eyebrow">Preview</span>
              <h2>Auction Preview</h2>
            </div>
            <span className="status-badge warning">DRAFT</span>
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

export default CreateAuctionPage
