'use client'

import { useState, useEffect } from 'react'
import { formatNumber, formatEth } from '@/lib/utils'

interface Company {
  id: number
  name: string
  ticker: string
  ethHoldings: number
  ethAddresses: string | null
  marketCap: string | null
  sharesOutstanding: string | null
  stockPrice: number | null
  ethPerShare: number | null
  mnavRatio: number | null
  stakingYield: number | null
  yieldSources: string | null
  capitalStructure: string | null
  fundingSources: string | null
  isActive: boolean
  lastUpdated: string
  createdAt: string
}

export default function CompanyManagement() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      console.log('🔍 Fetching companies...')
      
      // First, let's check authentication status
      const authResponse = await fetch('/api/admin/auth', {
        credentials: 'include'
      })
      const authResult = await authResponse.json()
      console.log('🔐 Auth status:', authResult)
      
      const response = await fetch('/api/admin/companies', {
        credentials: 'include' // Ensure cookies are sent
      })
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
      
      const result = await response.json()
      console.log('📊 Companies fetch result:', JSON.stringify(result, null, 2))

      if (result.success) {
        setCompanies(result.companies)
        setError('') // Clear any previous errors
      } else {
        setError(result.error || 'Failed to fetch companies')
      }
    } catch (error) {
      console.error('❌ Fetch companies error:', error)
      setError('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (companyData: Partial<Company>) => {
    try {
      const isEditing = !!editingCompany
      const url = '/api/admin/companies'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...companyData,
          id: isEditing ? editingCompany.id : undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        await fetchCompanies()
        setEditingCompany(null)
        setShowAddForm(false)
      } else {
        setError(result.error || 'Failed to save company')
      }
    } catch (error) {
      setError('Network error')
    }
  }

  const handleDelete = async (companyId: number) => {
    if (!confirm('Are you sure you want to deactivate this company?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/companies?id=${companyId}`, {
        method: 'DELETE',
        credentials: 'include' // Ensure cookies are sent
      })

      const result = await response.json()

      if (result.success) {
        await fetchCompanies()
      } else {
        setError(result.error || 'Failed to delete company')
      }
    } catch (error) {
      setError('Network error')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading companies...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Company Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Add New Company
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Company List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ETH Holdings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shares Outstanding
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Market Cap
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {company.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {company.ticker}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatEth(company.ethHoldings || 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {company.stockPrice ? `$${formatNumber(company.stockPrice)}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {company.sharesOutstanding ? formatNumber(BigInt(company.sharesOutstanding)) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {company.marketCap ? formatNumber(BigInt(company.marketCap)) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    company.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {company.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => setEditingCompany(company)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingCompany) && (
        <CompanyForm
          company={editingCompany}
          onSave={handleSave}
          onCancel={() => {
            setShowAddForm(false)
            setEditingCompany(null)
          }}
        />
      )}
    </div>
  )
}

interface CompanyFormProps {
  company: Company | null
  onSave: (data: Partial<Company>) => void
  onCancel: () => void
}

function CompanyForm({ company, onSave, onCancel }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    ticker: company?.ticker || '',
    website: (company as any)?.website || '',
    ethHoldings: company?.ethHoldings || 0,
    ethAddresses: company?.ethAddresses || '',
    marketCap: company?.marketCap || '',
    sharesOutstanding: company?.sharesOutstanding || '',
    stockPrice: company?.stockPrice || 0,
    ethPerShare: company?.ethPerShare || 0,
    mnavRatio: company?.mnavRatio || 0,
    stakingYield: company?.stakingYield || 0,
    yieldSources: company?.yieldSources || '',
    capitalStructure: company?.capitalStructure || '',
    fundingSources: company?.fundingSources || '',
    isActive: company?.isActive !== undefined ? company.isActive : true
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {company ? 'Edit Company' : 'Add New Company'}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ticker *</label>
              <input
                type="text"
                required
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://company.com"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ETH Holdings</label>
              <input
                type="number"
                step="0.000001"
                value={formData.ethHoldings}
                onChange={(e) => setFormData({ ...formData, ethHoldings: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Price (USD)</label>
              <input
                type="number"
                step="0.01"
                value={formData.stockPrice}
                onChange={(e) => setFormData({ ...formData, stockPrice: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Shares Outstanding</label>
              <input
                type="number"
                value={formData.sharesOutstanding}
                onChange={(e) => setFormData({ ...formData, sharesOutstanding: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Market Cap (USD)</label>
              <input
                type="number"
                value={formData.marketCap}
                onChange={(e) => setFormData({ ...formData, marketCap: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">ETH Addresses (JSON array)</label>
            <textarea
              value={formData.ethAddresses}
              onChange={(e) => setFormData({ ...formData, ethAddresses: e.target.value })}
              placeholder='["0x742d35Cc6634C0532925a3b8D0c4E5E3F8B5C5E5"]'
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ETH per Share</label>
              <input
                type="number"
                step="0.000001"
                value={formData.ethPerShare}
                onChange={(e) => setFormData({ ...formData, ethPerShare: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">mNAV Ratio</label>
              <input
                type="number"
                step="0.01"
                value={formData.mnavRatio}
                onChange={(e) => setFormData({ ...formData, mnavRatio: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Staking Yield (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.stakingYield}
                onChange={(e) => setFormData({ ...formData, stakingYield: parseFloat(e.target.value) || 0 })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Yield Sources</label>
            <input
              type="text"
              value={formData.yieldSources}
              onChange={(e) => setFormData({ ...formData, yieldSources: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Capital Structure</label>
            <input
              type="text"
              value={formData.capitalStructure}
              onChange={(e) => setFormData({ ...formData, capitalStructure: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Funding Sources</label>
            <input
              type="text"
              value={formData.fundingSources}
              onChange={(e) => setFormData({ ...formData, fundingSources: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {company ? 'Update' : 'Create'} Company
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
