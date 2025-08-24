import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || session.user.email !== 'bob@bobgourley.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Starting database migration...')

    // Run the migration SQL directly
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "etfs" (
          "id" SERIAL NOT NULL,
          "symbol" TEXT NOT NULL,
          "name" TEXT,
          "eth_holdings" DOUBLE PRECISION,
          "total_value" DOUBLE PRECISION,
          "assets_under_management" DOUBLE PRECISION,
          "expense_ratio" DOUBLE PRECISION,
          "inception_date" TIMESTAMP(3),
          "description" TEXT,
          "website" TEXT,
          "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "is_active" BOOLEAN NOT NULL DEFAULT true,

          CONSTRAINT "etfs_pkey" PRIMARY KEY ("id")
      );
    `

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "etfs_symbol_key" ON "etfs"("symbol");
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "etf_metrics" (
          "id" SERIAL NOT NULL,
          "total_etfs" INTEGER NOT NULL DEFAULT 0,
          "total_eth_holdings" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "total_aum" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "average_expense_ratio" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

          CONSTRAINT "etf_metrics_pkey" PRIMARY KEY ("id")
      );
    `

    console.log('✅ Database migration completed successfully')

    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully' 
    })

  } catch (error) {
    console.error('❌ Database migration failed:', error)
    return NextResponse.json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
