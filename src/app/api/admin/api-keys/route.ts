import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/auth'
import { 
  getAllApiKeys, 
  storeApiKey, 
  deleteApiKey, 
  testApiKey 
} from '@/lib/apiKeys'

/**
 * GET /api/admin/api-keys - Get all API keys (without actual key values)
 */
export async function GET() {
  try {
    // Verify admin session
    const sessionToken = await verifySession()
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKeys = await getAllApiKeys()
    return NextResponse.json({ apiKeys })
  } catch (error) {
    console.error('Failed to get API keys:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve API keys' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/api-keys - Add or update an API key
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const sessionToken = await verifySession()
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, key, description, testKey = false } = body

    // Validate required fields
    if (!name || !key) {
      return NextResponse.json(
        { error: 'Name and key are required' },
        { status: 400 }
      )
    }

    // Test the API key if requested
    if (testKey) {
      const testResult = await testApiKey(name, key)
      if (!testResult.valid) {
        return NextResponse.json(
          { error: `API key test failed: ${testResult.error}` },
          { status: 400 }
        )
      }
    }

    // Store the API key
    const success = await storeApiKey(name, key, description)
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to store API key' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'API key stored successfully',
      tested: testKey 
    })
  } catch (error) {
    console.error('Failed to store API key:', error)
    return NextResponse.json(
      { error: 'Failed to store API key' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/api-keys - Delete an API key
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin session
    const sessionToken = await verifySession()
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name')

    if (!name) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      )
    }

    const success = await deleteApiKey(name)
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete API key' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'API key deleted successfully' })
  } catch (error) {
    console.error('Failed to delete API key:', error)
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    )
  }
}
