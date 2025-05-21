import { useState } from 'react'
import './App.css'

function App() {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'usd'
  })
  const [productId, setProductId] = useState('')
  const [message, setMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCreatePayment = async (e) => {
    e.preventDefault()
    try {
      if (formData.name.length < 3) {
        setMessage('Name must be at least 3 characters long')
        return
      }

      const amount = Number(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        setMessage('Please enter a valid amount')
        return
      }

      const response = await fetch('http://localhost:4000/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: amount
        })
      })
      const data = await response.json()
      
      if (data.message?.detail) {
        const errorMessage = data.message.detail[0]?.msg || 'Error creating payment'
        setMessage(errorMessage)
        return
      }

      if (data.message?.type === 'Success' && data.message?.productId) {
        setProductId(data.message.productId)
        setMessage('Payment created successfully!')
      } else {
        setMessage('Unexpected response from server')
      }
    } catch (error) {
      setMessage('Error creating payment')
    }
  }

  const handleConfirmPayment = async () => {
    try {
      const response = await fetch('http://localhost:4000/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: [productId],
          returnUrl: window.location.origin
        })
      })
      const data = await response.json()
      if (data.message?.paymentLink) {
        window.location.href = data.message.paymentLink
      }
    } catch (error) {
      setMessage('Error confirming payment')
    }
  }

  return (
    <div className="container">
      <h1>Payment System</h1>
      
      <form onSubmit={handleCreatePayment} className="payment-form">
        <div className="form-group">
          <label htmlFor="name">Name (min 3 characters):</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            minLength="3"
            required
            placeholder="Enter name (min 3 characters)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (in cents):</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            min="1"
            step="1"
            required
          />
          <small className="helper-text">Enter amount in cents (e.g., 1000 for $10.00)</small>
        </div>

        <div className="form-group">
          <label htmlFor="currency">Currency:</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
          >
            <option value="usd">usd</option>
            <option value="eur">eur</option>
          </select>
        </div>

        <button type="submit">Create Payment</button>
      </form>

      {productId && (
        <div className="confirmation-section">
          <p>Payment created! ID: {productId}</p>
          <button onClick={handleConfirmPayment} className="confirm-button">
            Confirm Payment
          </button>
        </div>
      )}

      {message && <p className="message">{message}</p>}
    </div>
  )
}

export default App
