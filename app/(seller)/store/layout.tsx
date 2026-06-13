import { StorePathTracker } from './_components/StorePathTracker'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StorePathTracker />
      {children}
    </>
  )
}
