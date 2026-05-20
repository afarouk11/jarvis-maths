import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

// Receives inbound WhatsApp messages from Twilio and queues them as agent commands.
// Set this URL in Twilio console → Messaging → WhatsApp Sandbox → "When a message comes in":
// https://studiq.org/api/whatsapp

const KNOWN_COMMANDS = ['run tests', 'test', 'status', 'briefing', 'report', 'help']

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function twimlResponse(msg: string) {
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${msg}</Message></Response>`,
    { headers: { 'Content-Type': 'text/xml' } }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const params = new URLSearchParams(body)

  const from    = params.get('From') ?? ''
  const message = (params.get('Body') ?? '').trim().toLowerCase()

  if (!from || !message) {
    return twimlResponse('Could not parse message.')
  }

  if (message === 'help') {
    return twimlResponse(
      '🧠 StudiQ OS Commands:\n' +
      '• run tests — full UX/UI test suite\n' +
      '• status — platform stats briefing\n' +
      '• briefing — morning stats summary\n' +
      '• report — resend last test report'
    )
  }

  const matched = KNOWN_COMMANDS.find(c => message.includes(c))
  if (!matched) {
    return twimlResponse(`Unknown command: "${message}"\nSend *help* for available commands.`)
  }

  // Queue the command in Supabase for the local test-agent to pick up
  const { error } = await adminClient()
    .from('agent_commands')
    .insert({ command: matched, source: 'whatsapp', triggered_by: from })

  if (error) {
    console.error('[whatsapp webhook]', error)
    return twimlResponse('Command received but could not queue — check agent_commands table.')
  }

  const replies: Record<string, string> = {
    'run tests': '🧪 Test suite queued! Report incoming in ~2 minutes.',
    'test':      '🧪 Test suite queued! Report incoming in ~2 minutes.',
    'status':    '📊 Fetching platform stats — incoming shortly.',
    'briefing':  '☀️ Briefing queued — incoming shortly.',
    'report':    '📋 Resending last report now.',
  }

  return twimlResponse(replies[matched] ?? `✅ "${matched}" queued.`)
}
