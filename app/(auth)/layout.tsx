import { Ambient } from '@/components/Ambient'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Ambient />
      <div className="stage">{children}</div>
    </>
  )
}
