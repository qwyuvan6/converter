import React, { useState, useEffect } from 'react'
import { ArrowLeftRight, DollarSign, IndianRupee, RefreshCw } from 'lucide-react'

const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD'

function App() {
  const [amount, setAmount] = useState<string>('1')
  const [fromCurrency, setFromCurrency] = useState<'USD' | 'INR'>('USD')
  const [toCurrency, setToCurrency] = useState<'USD' | 'INR'>('INR')
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)

  useEffect(() => {
    fetchExchangeRate()
    const interval = setInterval(fetchExchangeRate, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (exchangeRate !== null) {
      const numAmount = parseFloat(amount)
      if (!isNaN(numAmount)) {
        setConvertedAmount(fromCurrency === 'USD' ? numAmount * exchangeRate : numAmount / exchangeRate)
      }
    }
  }, [amount, exchangeRate, fromCurrency])

  const fetchExchangeRate = async () => {
    try {
      setError(null)
      setIsUpdating(true)
      const response = await fetch(API_URL)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      if (data && data.rates && data.rates.INR) {
        setExchangeRate(data.rates.INR)
        setLastUpdated(new Date().toLocaleString())
      } else {
        throw new Error('Invalid data structure')
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error)
      setError('Failed to fetch exchange rate. Please try again later.')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSwap = () => {
    setFromCurrency(prev => prev === 'USD' ? 'INR' : 'USD')
    setToCurrency(prev => prev === 'USD' ? 'INR' : 'USD')
    if (convertedAmount !== null) {
      setAmount(convertedAmount.toFixed(2))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-lg shadow-2xl p-8 w-full max-w-md border border-white border-opacity-20">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">Currency Converter</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 text-red-100 rounded-md">
            {error}
          </div>
        )}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-200 mb-1">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white bg-opacity-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                  placeholder="Enter amount"
                />
                {fromCurrency === 'USD' ? (
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                ) : (
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            <button
              onClick={handleSwap}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-110"
            >
              <ArrowLeftRight className="h-6 w-6" />
            </button>
          </div>
          <div>
            <label htmlFor="result" className="block text-sm font-medium text-gray-200 mb-1">Converted Amount</label>
            <div className="relative">
              <input
                type="text"
                id="result"
                value={convertedAmount !== null ? convertedAmount.toFixed(2) : ''}
                readOnly
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white bg-opacity-10 text-white focus:outline-none sm:text-sm"
              />
              {toCurrency === 'USD' ? (
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              ) : (
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          {exchangeRate !== null && (
            <p className="text-lg text-gray-200 font-semibold">
              1 USD = {exchangeRate.toFixed(4)} INR
            </p>
          )}
          <p className="text-sm text-gray-300 mt-2">
            Last updated: {lastUpdated || 'Never'}
          </p>
          <button
            onClick={fetchExchangeRate}
            disabled={isUpdating}
            className={`mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Updating...' : 'Update Rate'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App