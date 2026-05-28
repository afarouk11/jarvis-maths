import { redirect } from 'next/navigation'

// Redirect students sub-route to main teacher overview for now
export default function TeacherStudentsPage() {
  redirect('/teacher')
}
