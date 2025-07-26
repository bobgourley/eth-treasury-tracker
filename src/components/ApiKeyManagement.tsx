'use client'

import { useState, useEffect } from 'react'
import { KeyIcon, CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

interface ApiKey {
  id: number
  name: string
  description: string | null
  isActive: boolean
  hasKey: boolean
  createdAt: string
  updatedAt: string
}

interface ApiKeyFormData {
  name: string
  key: string
  description: string
}

export default function ApiKeyManagement() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState<ApiKeyFormData>({
    name: '',
    key: '',
    description: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [testing, setTesting] = useState(false)

  const predefinedKeys = [
    {
      name: 'etherscan',
      description: 'Etherscan API for Ethereum blockchain data and ETH balances',
      placeholder: 'Enter your Etherscan API key'
    },
    {
      name: 'coingecko',
      description: 'CoinGecko API for cryptocurrency prices and market data',
      placeholder: 'Enter your CoinGecko API key (optional for basic usage)'
    },
    {
      name: 'alpha_vantage',
      description: 'Alpha Vantage API for stock market data and financial information',
      placeholder: 'Enter your Alpha Vantage API key'
    }
  ]

  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/api-keys')
      
      if (!response.ok) {
        throw new Error('Failed to fetch API keys')
      }
      
      const data = await response.json()
      setApiKeys(data.apiKeys)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, testKey = false) => {
    e.preventDefault()
    
    if (!formData.name || !formData.key) {
      setError('Name and key are required')
      return
    }

    try {
      if (testKey) {
        setTesting(true)
      } else {
        setSubmitting(true)
      }
      
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          testKey
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save API key')
      }
      
      if (testKey) {
        alert('✅ API key test successful!')
      } else {
        setShowForm(false)
        setEditingKey(null)
        setFormData({ name: '', key: '', description: '' })
        await fetchApiKeys()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key')
    } finally {
      setSubmitting(false)
      setTesting(false)
    }
  }

  const handleEdit = (keyName: string) => {
    const existingKey = apiKeys.find(k => k.name === keyName)
    if (existingKey) {
      setFormData({
        name: existingKey.name,
        key: '', // Don't pre-fill the actual key for security
        description: existingKey.description || ''
      })
      setEditingKey(keyName)
      setShowForm(true)
    }
  }

  const handleDelete = async (keyName: string) => {
    if (!confirm(`Are you sure you want to delete the ${keyName} API key?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/api-keys?name=${keyName}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete API key')
      }
      
      await fetchApiKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key')
    }
  }

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }))
  }

  const getKeyInfo = (keyName: string) => {
    return predefinedKeys.find(k => k.name === keyName)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-600">Loading API keys...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">API Key Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add API Key
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Configured API Keys</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {apiKeys.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No API keys configured yet. Add your first API key to enable live data integration.
            </div>
          ) : (
            apiKeys.map((apiKey) => {
              const keyInfo = getKeyInfo(apiKey.name)
              return (
                <div key={apiKey.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <KeyIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 capitalize">
                          {apiKey.name.replace('_', ' ')}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {keyInfo?.description || apiKey.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {apiKey.hasKey ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-red-500" />
                        )}
                        <span className="text-sm text-gray-600">
                          {apiKey.hasKey ? 'Configured' : 'Not Set'}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleEdit(apiKey.name)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {apiKey.hasKey ? 'Update' : 'Set'}
                      </button>
                      
                      {apiKey.hasKey && (
                        <button
                          onClick={() => handleDelete(apiKey.name)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingKey ? `Update ${editingKey} API Key` : 'Add API Key'}
            </h3>
            
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key Name
                </label>
                {editingKey ? (
                  <input
                    type="text"
                    value={formData.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                ) : (
                  <select
                    value={formData.name}
                    onChange={(e) => {
                      const selectedKey = predefinedKeys.find(k => k.name === e.target.value)
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        description: selectedKey?.description || ''
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select API Key Type</option>
                    {predefinedKeys.map(key => (
                      <option key={key.name} value={key.name}>
                        {key.name.replace('_', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeys[formData.name] ? 'text' : 'password'}
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder={getKeyInfo(formData.name)?.placeholder || 'Enter API key'}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility(formData.name)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys[formData.name] ? (
                      <EyeSlashIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional description for this API key"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={testing || submitting || !formData.key}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {testing ? 'Testing...' : 'Test Key'}
                </button>
                
                <button
                  type="submit"
                  disabled={submitting || testing}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Key'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingKey(null)
                    setFormData({ name: '', key: '', description: '' })
                    setError(null)
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
