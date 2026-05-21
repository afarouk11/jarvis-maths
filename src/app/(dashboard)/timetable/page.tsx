import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TimetableClient } from './TimetableClient'

export default async function TimetablePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('profiles')
    .select('exam_date, target_grade, full_name')
    .eq('id', user.id)
    .single()

  return (
    <TimetableClient
      profile={{
        exam_date: profile?.exam_date ?? null,
        target_grade: profile?.target_grade ?? 'A',
        full_name: profile?.full_name ?? null,
      }}
    />
  )
}
