import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#111111]">
      <Sidebar />
      <main className="md:ml-60 flex-1 min-h-screen min-w-0 overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}
