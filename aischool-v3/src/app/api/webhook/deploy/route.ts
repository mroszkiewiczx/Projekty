import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(req: Request) {
  try {
    // Verify webhook secret
    const secret = req.headers.get('x-webhook-secret')
    const expectedSecret = process.env.WEBHOOK_SECRET || 'dev-secret'

    if (secret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    console.log('Deploy webhook triggered:', body)

    // Execute deploy script asynchronously (don't wait)
    execAsync('/opt/deploy-scripts/aischool-deploy.sh').catch(err => {
      console.error('Deploy script error:', err)
    })

    return NextResponse.json({
      success: true,
      message: 'Deployment triggered',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook failed' },
      { status: 500 }
    )
  }
}
