import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, role, school, message } = body

  if (!name || !email || !role || !school) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase.from('school_enquiries').insert({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    school: school.trim(),
    message: message?.trim() ?? null,
  })

  if (error) {
    console.error('[school-enquiry]', error)
    return Response.json({ error: 'Failed to save enquiry' }, { status: 500 })
  }

  return Response.json({ success: true })
}
