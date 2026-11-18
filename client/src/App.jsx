import { useState, useEffect, useRef } from 'react'
import './App.css'
import './details.css'
import CinematicHero from './CinematicHero'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const API_URL = 'http://localhost:5000'

function App() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState('Lost')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const [showAuth, setShowAuth] = useState(false)
  const [authType, setAuthType] = useState('Login')
  const [selectedItem, setSelectedItem] = useState(null)

  const cinematicSectionsRef = useRef(null)

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('finditUser')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [authData, setAuthData] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    location: '',
    description: '',
    reporterName: '',
    reporterPhone: '',
    showContact: false
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [items, setItems] = useState([])

  useEffect(() => {
    fetchItems()
  }, [])

  async function fetchItems() {
    try {
      const response = await fetch(`${API_URL}/api/items`)
      if (!response.ok) throw new Error('Could not load items')
      const data = await response.json()
      setItems(data)
    } catch {
      setError('Unable to load items. Please check the backend server.')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = items.filter((item) =>
    (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.category || '').toLowerCase().includes(search.toLowerCase())
  )

  const lostCount = items.filter(item => item.status === 'Lost').length
  const foundCount = items.filter(item => item.status === 'Found').length
  const categoryCount = new Set(items.map(item => item.category)).size

  // CINEMATIC ANIMATION ENGINE
  useEffect(() => {
    const root = cinematicSectionsRef.current
    if (!root || loading) return

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {

        gsap.from('.motion-heading', {
          y: 45, opacity: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.items-section', start: 'top 80%', once: true }
        })

        gsap.fromTo(
          '.cinematic-item-card',
          { y: 65, opacity: 0, scale: 0.96 },
          {
            y: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.15, ease: 'power3.out',
            scrollTrigger: { trigger: '.items-grid', start: 'top 85%', once: true }
          }
        )

        gsap.from('.cinematic-item-image', {
          clipPath: 'inset(0 0 100% 0)', duration: 1.1, stagger: 0.15, ease: 'power3.inOut',
          scrollTrigger: { trigger: '.items-grid', start: 'top 85%', once: true }
        })

        gsap.from('.step-card', {
          y: 60, opacity: 0, stagger: 0.2, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '.how-section', start: 'top 75%', once: true }
        })

        gsap.fromTo(
          '.timeline-progress',
          { scaleX: 0 },
          {
            scaleX: 1, ease: 'none',
            scrollTrigger: {
              trigger: '.steps-grid', start: 'top 75%', end: 'bottom 65%', scrub: 1
            }
          }
        )

        gsap.from('.step-icon', {
          scale: 0.5, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: '.steps-grid', start: 'top 80%', once: true }
        })

        gsap.from('.stat-card', {
          y: 50, opacity: 0, stagger: 0.15, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: '.stats-section', start: 'top 80%', once: true }
        })

        gsap.utils.toArray('.stat-number').forEach((element) => {
          const target = Number(element.dataset.value)
          const counter = { value: 0 }

          gsap.to(counter, {
            value: target,
            duration: 2,
            ease: 'power2.out',
            scrollTrigger: { trigger: element, start: 'top 90%', once: true },
            onUpdate: () => {
              element.textContent = Math.round(counter.value)
            }
          })
        })

        gsap.to('.stats-glow', {
          x: 60, y: -30, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut'
        })

        gsap.from('.footer-content', {
          y: 45, opacity: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.footer', start: 'top 90%', once: true }
        })

      }, root)

      return () => ctx.revert()
    })

    return () => mm.revert()
  }, [loading, items.length])

  // AUTHENTICATION
  async function handleAuthSubmit(e) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    try {
      const endpoint = authType === 'Login' ? 'login' : 'signup'

      const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }

      if (authType === 'Sign Up') {
        setAuthType('Login')
        setAuthData({ name: '', email: authData.email, password: '' })
        setAuthError('Account created successfully! Please login.')
      } else {
        localStorage.setItem('finditToken', data.token)
        localStorage.setItem('finditUser', JSON.stringify(data.user))

        setCurrentUser(data.user)
        setShowAuth(false)
        setAuthData({ name: '', email: '', password: '' })
        setAuthError('')
      }
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setAuthLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('finditToken')
    localStorage.removeItem('finditUser')
    setCurrentUser(null)
    setSelectedItem(null)
    setShowForm(false)
  }

  // OPEN REPORT FORM (login required)
  function openReportForm(type) {
    if (!currentUser) {
      setAuthType('Login')
      setAuthError('Please login to report an item.')
      setShowAuth(true)
      return
    }

    setFormType(type)
    setError('')
    setShowForm(true)
  }

  // OPEN / CLOSE ITEM DETAILS
  function openDetails(item) {
    setSelectedItem(item)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  function closeDetails() {
    setSelectedItem(null)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  // HANDLE ITEM IMAGE SELECTION
  function handleImageChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      setError('Please select a JPG, PNG or WEBP image.')
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5 MB.')
      e.target.value = ''
      return
    }

    setError('')
    setImageFile(file)

    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(URL.createObjectURL(file))
  }

  function removeSelectedImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview)

    setImageFile(null)
    setImagePreview('')

    const imageInput = document.getElementById('item-image-upload')
    if (imageInput) imageInput.value = ''
  }

  // OWNER CHECK
  function getId(value) {
    if (!value) return ''
    if (typeof value === 'object') return String(value._id || value.id || '')
    return String(value)
  }

  function getMyIdFromToken() {
    try {
      const token = localStorage.getItem('finditToken')
      if (!token) return ''

      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(base64))

      return getId(
        payload.id ||
        payload._id ||
        payload.userId ||
        payload.user?.id ||
        payload.user?._id
      )
    } catch {
      return ''
    }
  }

  function isOwner(item) {
    const myId =
      getId(currentUser?._id || currentUser?.id || currentUser?.userId) ||
      getMyIdFromToken()

    const ownerId = getId(item?.user)

    return Boolean(myId && ownerId && myId === ownerId)
  }

  // DELETE ITEM (only owner)
  async function handleDeleteItem(item) {
    if (!window.confirm('Are you sure you want to delete this report?')) return

    setDeleting(true)

    try {
      const token = localStorage.getItem('finditToken')

      const response = await fetch(`${API_URL}/api/items/${item._id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-auth-token': token || ''
        }
      })

      const data = await response.json().catch(() => ({}))

      if (response.status === 401) {
        throw new Error('Your session has expired. Please login again.')
      }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete report')
      }

      setItems(previous => previous.filter(i => i._id !== item._id))
      closeDetails()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // REPORT ITEM
  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const uploadData = new FormData()

      uploadData.append('name', formData.name)
      uploadData.append('category', formData.category)
      uploadData.append('location', formData.location)
      uploadData.append('description', formData.description)
      uploadData.append('reporterName', currentUser?.name || formData.reporterName)
      uploadData.append('reporterPhone', formData.reporterPhone)
      uploadData.append('showContact', String(formData.showContact))
      uploadData.append('status', formType)

      if (imageFile) uploadData.append('image', imageFile)

      const response = await fetch(`${API_URL}/api/items`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('finditToken')}`
        },
        body: uploadData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to submit report')
      }

      setItems(previousItems => [data, ...previousItems])

      setFormData({
        name: '',
        category: 'Electronics',
        location: '',
        description: '',
        reporterName: '',
        reporterPhone: '',
        showContact: false
      })

      removeSelectedImage()
      setShowForm(false)
    } catch (error) {
      setError(error.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  // LOGIN / SIGNUP PAGE
  if (showAuth) {
    return (
      <div className="auth-page">
        <div className="auth-page-header">
          <h2>Find<span>It.</span></h2>
          <button onClick={() => setShowAuth(false)}>← Back to Home</button>
        </div>

        <div className="auth-page-content">
          <div className="auth-page-info">
            <h1>FindIt.</h1>
            <h2>Lost something? Found something?</h2>
            <p>
              Join our community and help people reconnect
              with their lost belongings.
            </p>
          </div>

          <div className="auth-page-form">
            <h2>{authType === 'Login' ? 'Welcome Back!' : 'Create Account'}</h2>

            <p>
              {authType === 'Login'
                ? 'Login to your FindIt account.'
                : 'Create your account to get started.'}
            </p>

            <form onSubmit={handleAuthSubmit}>
              {authType === 'Sign Up' && (
                <>
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={authData.name}
                    onChange={e => setAuthData({ ...authData, name: e.target.value })}
                    required
                  />
                </>
              )}

              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={authData.email}
                onChange={e => setAuthData({ ...authData, email: e.target.value })}
                required
              />

              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={authData.password}
                onChange={e => setAuthData({ ...authData, password: e.target.value })}
                required
                minLength="6"
              />

              {authError && <p className="auth-message">{authError}</p>}

              <button type="submit" disabled={authLoading}>
                {authLoading
                  ? 'Please wait...'
                  : authType === 'Login'
                    ? 'Login'
                    : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              {authType === 'Login'
                ? "Don't have an account?"
                : 'Already have an account?'}

              <button
                type="button"
                onClick={() => {
                  setAuthType(authType === 'Login' ? 'Sign Up' : 'Login')
                  setAuthError('')
                  setAuthData({ ...authData, password: '' })
                }}
              >
                {authType === 'Login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ITEM DETAILS PAGE
  if (selectedItem) {
    const itemImage = selectedItem.image
      ? selectedItem.image.startsWith('http')
        ? selectedItem.image
        : `${API_URL}${selectedItem.image}`
      : null

    return (
      <div className="app details-page">

        <nav className="navbar">
          <div className="logo" onClick={closeDetails} style={{ cursor: 'pointer' }}>
            Find<span>It.</span>
          </div>

          <button className="secondary-btn" onClick={closeDetails}>
            ← Back to Home
          </button>
        </nav>

        <section className="items-section details-section">

          <div className="section-heading">
            <div>
              <span className="section-tag">ITEM INFORMATION</span>
              <h2>Item Details</h2>
              <p>Complete information about the reported item.</p>
            </div>
          </div>

          <div className="item-card details-page-card">

            <div className="item-image details-image">
              {itemImage ? (
                <img
                  src={itemImage}
                  alt={selectedItem.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              ) : (
                <span className="item-emoji">📦</span>
              )}

              <span className={`status ${selectedItem.status === 'Lost' ? 'lost' : 'found'}`}>
                {selectedItem.status}
              </span>
            </div>

            <div className="item-info details-info">

              <div className="details-top">
                <span className="item-category">{selectedItem.category}</span>

                <span className={`details-status ${selectedItem.status === 'Lost' ? 'lost' : 'found'}`}>
                  {selectedItem.status} Item
                </span>
              </div>

              <h1 className="details-item-title">{selectedItem.name}</h1>

              <p className="details-subtitle">Reported item information</p>

              <div className="details-meta">

                <div className="details-meta-item">
                  <span className="details-meta-icon">⌖</span>
                  <div>
                    <span className="details-label">Location</span>
                    <strong>{selectedItem.location || 'Not available'}</strong>
                  </div>
                </div>

                <div className="details-meta-item">
                  <span className="details-meta-icon">▦</span>
                  <div>
                    <span className="details-label">Category</span>
                    <strong>{selectedItem.category || 'Not available'}</strong>
                  </div>
                </div>

                <div className="details-meta-item">
                  <span className="details-meta-icon">●</span>
                  <div>
                    <span className="details-label">Report Type</span>
                    <strong>{selectedItem.status}</strong>
                  </div>
                </div>

              </div>

              <div className="details-description">
                <h3>About This Item</h3>
                <p>
                  {selectedItem.description || 'No description available for this item.'}
                </p>
              </div>

              <div className="reporter-info">
                <h3>Reporter Information</h3>

                <div className="reporter-detail">
                  <span>Reporter Name</span>
                  <strong>{selectedItem.reporterName || 'Not available'}</strong>
                </div>

                <div className="reporter-detail">
                  <span>Contact Number</span>
                  <strong>
                    {selectedItem.showContact && selectedItem.reporterPhone ? (
                      <a href={`tel:${selectedItem.reporterPhone}`}>
                        {selectedItem.reporterPhone}
                      </a>
                    ) : (
                      'Not shared publicly'
                    )}
                  </strong>
                </div>
              </div>

              <div className="details-actions" style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button 
                  onClick={closeDetails}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    backgroundColor: '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  ← Back to Home
                </button>

                {isOwner(selectedItem) && (
                  <button
                    onClick={() => handleDeleteItem(selectedItem)}
                    disabled={deleting}
                    style={{
                      flex: 1,
                      padding: '12px 20px',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      textAlign: 'center',
                      boxSizing: 'border-box'
                    }}
                  >
                    {deleting ? 'Deleting...' : '🗑 Delete My Report'}
                  </button>
                )}
              </div>

            </div>
          </div>
        </section>

        <footer className="footer">
          <h2>Find<span>It.</span></h2>
          <p>Helping lost belongings find their way home.</p>
          <small>© 2026 FindIt. All rights reserved.</small>
        </footer>

      </div>
    )
  }

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">

        <div className="logo">
          Find<span>It.</span>
        </div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#items">Browse Items</a>
          <a href="#how-it-works">How It Works</a>
        </div>

        <div className="nav-buttons">
          {currentUser ? (
            <>
              <span>Welcome, {currentUser.name}</span>
              <button className="login-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button
                className="login-btn"
                onClick={() => {
                  setAuthType('Login')
                  setAuthError('')
                  setShowAuth(true)
                }}
              >
                Login
              </button>

              <button
                className="signup-btn"
                onClick={() => {
                  setAuthType('Sign Up')
                  setAuthError('')
                  setShowAuth(true)
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      {/* CINEMATIC HERO */}
      <CinematicHero
        search={search}
        setSearch={setSearch}
        onSearch={() =>
          document.getElementById('items')?.scrollIntoView({ behavior: 'smooth' })
        }
        onReportLost={() => openReportForm('Lost')}
        onReportFound={() => openReportForm('Found')}
      />

      <div className="cinematic-below-hero" ref={cinematicSectionsRef}>

        {/* REPORT FORM */}
        {showForm && (
          <section className="report-section">

            <div className="report-form-container">
              <h2>Report {formType} Item</h2>

              <p>Provide the details of your item below.</p>

              {error && <p className="no-results">{error}</p>}

              <form onSubmit={handleSubmit}>

                <label>Item Name</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>Electronics</option>
                  <option>Accessories</option>
                  <option>Documents</option>
                  <option>Books</option>
                  <option>Stationery</option>
                  <option>Clothing</option>
                  <option>Vehicles</option>
                  <option>Other</option>
                </select>

                <label>Location</label>
                <input
                  type="text"
                  placeholder="Where was it lost or found?"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  required
                />

                <label>Description</label>
                <textarea
                  placeholder="Describe your item..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  required
                />

                <label htmlFor="item-image-upload">Upload Item Image (Optional)</label>
                <input
                  id="item-image-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />

                {imagePreview && (
                  <div className="image-preview-container" style={{ margin: '12px 0' }}>
                    <img
                      src={imagePreview}
                      alt="Selected item preview"
                      style={{
                        width: '100%',
                        maxHeight: '230px',
                        objectFit: 'contain',
                        borderRadius: '12px'
                      }}
                    />

                    <button type="button" className="cancel-btn" onClick={removeSelectedImage}>
                      Remove Image
                    </button>
                  </div>
                )}

                {!currentUser && (
                  <>
                    <label>Reporter Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={formData.reporterName}
                      onChange={e => setFormData({ ...formData, reporterName: e.target.value })}
                      required
                    />
                  </>
                )}

                <label>Contact Number</label>
                <input
                  type="tel"
                  placeholder="Enter contact number"
                  value={formData.reporterPhone}
                  onChange={e => setFormData({ ...formData, reporterPhone: e.target.value })}
                  required
                />

                <label className="contact-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.showContact}
                    onChange={e => setFormData({ ...formData, showContact: e.target.checked })}
                  />
                  Allow visitors to see my contact number
                </label>

                <button type="submit" className="primary-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    removeSelectedImage()
                    setShowForm(false)
                  }}
                >
                  Cancel
                </button>

              </form>
            </div>
          </section>
        )}

        {/* RECENTLY REPORTED ITEMS */}
        <section className="items-section cinematic-items-section" id="items">

          <div className="section-heading motion-heading">
            <div>
              <span className="section-tag">RECENT ACTIVITY / 01</span>
              <h2>Recently Reported Items</h2>
              <p>Every item has a story. Help us reconnect it with its owner.</p>
            </div>

            <a href="#items">Explore Items ↗</a>
          </div>

          {error && !showForm && <p className="no-results">{error}</p>}

          <div className="items-grid">

            {loading ? (
              <p>Loading items...</p>
            ) : filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <div className="item-card cinematic-item-card" key={item._id}>

                  <div className="item-image cinematic-item-image">

                    {item.image ? (
                      <img
                        src={
                          item.image.startsWith('http')
                            ? item.image
                            : `${API_URL}${item.image}`
                        }
                        alt={item.name}
                        className="uploaded-item-image"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    ) : (
                      <span className="item-emoji">📦</span>
                    )}

                    <span className={`status ${item.status === 'Lost' ? 'lost' : 'found'}`}>
                      {item.status}
                    </span>

                    <div className="image-overlay">
                      <span>FIND THE CONNECTION</span>
                    </div>

                  </div>

                  <div className="item-info">

                    <span className="item-category">{item.category}</span>

                    <h3>{item.name}</h3>

                    <p className="item-location">⌖ {item.location}</p>

                    <button className="details-btn" onClick={() => openDetails(item)}>
                      View Details <span>↗</span>
                    </button>

                  </div>
                </div>
              ))
            ) : (
              !error && <p className="no-results">No matching items found.</p>
            )}

          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-section cinematic-how-section" id="how-it-works">

          <div className="how-heading motion-heading">
            <span className="section-tag">THE JOURNEY / 02</span>
            <h2>Lost & Found. Connected.</h2>
            <p>Three simple steps to bring belongings back home.</p>
          </div>

          <div className="steps-grid cinematic-timeline">

            <div className="timeline-track"></div>
            <div className="timeline-progress"></div>

            <div className="step-card">
              <div className="step-number">01</div>
              <span className="step-icon">📝</span>
              <h3>Report an Item</h3>
              <p>Submit details about your lost or found item.</p>
              <span className="step-caption">START THE JOURNEY</span>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <span className="step-icon">🔍</span>
              <h3>Discover a Match</h3>
              <p>Explore reported items and discover possible matches.</p>
              <span className="step-caption">FIND THE CONNECTION</span>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <span className="step-icon">🤝</span>
              <h3>Reconnect</h3>
              <p>Connect with the other person and reunite with your belongings.</p>
              <span className="step-caption">COMPLETE THE JOURNEY</span>
            </div>

          </div>
        </section>

        {/* STATISTICS */}
        <section className="stats-section">

          <div className="stats-glow"></div>

          <div className="stats-heading motion-heading">
            <span className="section-tag">OUR COMMUNITY / 03</span>
            <h2>Making Lost Things Found.</h2>
            <p>Every report brings someone closer to what they lost.</p>
          </div>

          <div className="stats-grid">

            <div className="stat-card">
              <span className="stat-number" data-value={items.length}>0</span>
              <span className="stat-plus">+</span>
              <p>Total Reports</p>
            </div>

            <div className="stat-card">
              <span className="stat-number" data-value={lostCount}>0</span>
              <p>Lost Reports</p>
            </div>

            <div className="stat-card">
              <span className="stat-number" data-value={foundCount}>0</span>
              <p>Found Reports</p>
            </div>

            <div className="stat-card">
              <span className="stat-number" data-value={categoryCount}>0</span>
              <p>Item Categories</p>
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer className="footer cinematic-footer">

          <div className="footer-content">

            <div className="footer-brand">
              <h2>Find<span>It.</span></h2>
              <p>Helping lost belongings find their way home.</p>
            </div>

            <div className="footer-links">
              <a href="#home">Home</a>
              <a href="#items">Browse Items</a>
              <a href="#how-it-works">How It Works</a>
            </div>

            <div className="footer-line"></div>

            <small>© 2026 FindIt. All rights reserved.</small>

            <span className="footer-caption">LOST. FOUND. RECONNECTED.</span>

          </div>
        </footer>

      </div>
    </div>
  )
}

export default App