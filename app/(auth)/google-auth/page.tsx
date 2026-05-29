import { redirect } from 'next/navigation'

const API = process.env.API_URL ?? 'http://localhost:8080'

export default function GoogleAuthPage() {
  redirect(`${API}/api/auth/oauth2/authorization/google`)
}
