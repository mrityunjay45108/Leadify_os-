'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import axios from 'axios'

// Schema matches DB exactly — this fixes the known company_name mismatch
const clientSchema = z.object({
  name:         z.string().min(2, 'Name is required'),
  companyName:  z.string().optional(),
  email:        z.string().email('Valid email required'),
  phone:        z.string().optional(),
  whatsapp:     z.string().optional(),
  brandName:    z.string().optional(),
  industry:     z.string().optional(),
  gstNumber:    z.string().optional(),
  source:       z.string().optional(),
  status:       z.enum(['LEAD', 'NEW', 'ONBOARDING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'INACTIVE']).default('NEW'),
  notes:        z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  defaultValues?: Partial<ClientFormData>
  clientId?: string
  mode?: 'create' | 'edit'
}

export function ClientForm({ defaultValues, clientId, mode = 'create' }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: defaultValues ?? { status: 'NEW' },
  })

  async function onSubmit(data: ClientFormData) {
    setLoading(true)
    setError(null)
    try {
      if (mode === 'edit' && clientId) {
        await axios.patch(`/api/clients/${clientId}`, data)
      } else {
        await axios.post('/api/clients', data)
      }
      router.push('/clients')
      router.refresh()
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? 'Something went wrong'
        : 'Unexpected error'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name *" error={errors.name?.message}>
          <input {...register('name')} placeholder="Rahul Sharma" className={inputCls} />
        </Field>
        <Field label="Company Name" error={errors.companyName?.message}>
          {/* Using companyName (camelCase) — matches DB column company_name via Prisma */}
          <input {...register('companyName')} placeholder="Acme Pvt Ltd" className={inputCls} />
        </Field>
        <Field label="Email *" error={errors.email?.message}>
          <input {...register('email')} type="email" placeholder="rahul@acme.com" className={inputCls} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <input {...register('phone')} placeholder="+91 98765 43210" className={inputCls} />
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp?.message}>
          <input {...register('whatsapp')} placeholder="+91 98765 43210" className={inputCls} />
        </Field>
        <Field label="Brand Name" error={errors.brandName?.message}>
          <input {...register('brandName')} placeholder="AcmeBrand" className={inputCls} />
        </Field>
        <Field label="Industry" error={errors.industry?.message}>
          <input {...register('industry')} placeholder="D2C / SaaS / Fashion..." className={inputCls} />
        </Field>
        <Field label="GST / Tax ID" error={errors.gstNumber?.message}>
          <input {...register('gstNumber')} placeholder="27AAACS1234F1Z5" className={inputCls} />
        </Field>
        <Field label="Source" error={errors.source?.message}>
          <input {...register('source')} placeholder="Instagram / Referral / Cold DM..." className={inputCls} />
        </Field>
        <Field label="Status" error={errors.status?.message}>
          <select {...register('status')} className={inputCls}>
            {['LEAD', 'NEW', 'ONBOARDING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'INACTIVE'].map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Notes" error={errors.notes?.message}>
        <textarea
          {...register('notes')}
          rows={3}
          placeholder="Internal notes about this client..."
          className={`${inputCls} resize-none`}
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : mode === 'edit' ? 'Update Client' : 'Add Client'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-[#2a2a2a] px-5 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

const inputCls =
  'h-9 w-full rounded-lg bg-[#222] border border-[#2a2a2a] px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 transition-colors'
