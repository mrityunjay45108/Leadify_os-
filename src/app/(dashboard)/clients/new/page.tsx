import { Topbar } from '@/components/layout/Topbar'
import { ClientForm } from '@/components/clients/ClientForm'

export default function NewClientPage() {
  return (
    <div>
      <Topbar title="Add Client" subtitle="Create a new client account" />
      <div className="p-6">
        <ClientForm mode="create" />
      </div>
    </div>
  )
}
