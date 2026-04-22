import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, CheckCircle, Upload } from 'lucide-react'
import { supabase, uploadChampionImage } from '@/lib/supabase'
import type { Workload } from '@/types'

const WORKLOAD_COLORS: Record<string, string> = {
  Finance:          '#0078D4',
  'Supply Chain':   '#107C10',
  'Contact Center': '#D05F0A',
  'Field Service':  '#8764B8',
}

const schema = z.object({
  name:         z.string().min(2, 'Full name is required'),
  title:        z.string().min(2, 'Job title is required'),
  organization: z.string().min(2, 'Organization is required'),
  industry:     z.string().min(2, 'Industry is required'),
  linkedin_url: z
    .string()
    .url('Enter a valid URL')
    .startsWith('https://www.linkedin.com', 'Must be a LinkedIn URL')
    .or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export default function Submit() {
  const [workloads, setWorkloads] = useState<Workload[]>([])
  const [selectedWorkloads, setSelectedWorkloads] = useState<string[]>([])
  const [workloadError, setWorkloadError] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [editToken, setEditToken] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    supabase.from('workloads').select('*').order('name').then(({ data }) => {
      setWorkloads(data ?? [])
    })
  }, [])

  function toggleWorkload(id: string) {
    setWorkloadError(false)
    setSelectedWorkloads(prev =>
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    )
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function onSubmit(values: FormValues) {
    if (selectedWorkloads.length === 0) {
      setWorkloadError(true)
      return
    }
    setServerError(null)
    try {
      let image_url: string | null = null
      if (imageFile) {
        image_url = await uploadChampionImage(imageFile)
      }

      const { data: inserted, error } = await supabase.from('champions').insert({
        name:         values.name,
        title:        values.title,
        organization: values.organization,
        industry:     values.industry,
        workload_id:  selectedWorkloads[0],
        workload_ids: selectedWorkloads,
        linkedin_url: values.linkedin_url || null,
        image_url,
        status: 'pending',
      }).select('id, edit_token').single()

      if (error) throw error
      if (inserted?.id && inserted?.edit_token) {
        const stored = JSON.parse(localStorage.getItem('champion_tokens') || '{}')
        stored[inserted.id] = inserted.edit_token
        localStorage.setItem('champion_tokens', JSON.stringify(stored))
      }
      setEditToken(inserted?.edit_token ?? null)
      setSubmitted(true)
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Something went wrong. Please try again.'
      setServerError(msg)
    }
  }

  if (submitted) {
    const editUrl = editToken ? `${window.location.origin}/edit/${editToken}` : null
    return (
      <div className="min-h-screen bg-dynamics-light flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-md p-10 max-w-lg w-full text-center">
          <CheckCircle size={48} className="text-dynamics-green mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Application submitted!</h2>
          <p className="text-gray-500 text-sm mb-6">
            Your profile is under review. You'll appear in the directory once approved.
          </p>
          {editUrl && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-blue-800 mb-1">Save your edit link</p>
              <p className="text-xs text-blue-600 mb-3">
                Bookmark this link to update your profile later. It won't be shown again.
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-white border border-blue-200 rounded px-2 py-1.5 flex-1 truncate text-blue-700">
                  {editUrl}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(editUrl)}
                  className="btn-secondary text-xs px-3 py-1.5 shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
          <Link to="/" className="btn-primary justify-center">Back to Champions</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dynamics-light">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link to="/" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={18} />
          </Link>
          <span className="font-semibold text-gray-900">Join the Directory</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Connect with Champions</h1>
          <p className="text-sm text-gray-500 mb-7">
            Fill in your details. Your submission will be reviewed before going live.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Photo upload */}
            <div>
              <label className="label">Profile Photo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={20} className="text-gray-400" />
                  )}
                </div>
                <label className="btn-secondary cursor-pointer text-xs px-3 py-1.5">
                  Choose photo
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="label">Full Name *</label>
              <input className="input" placeholder="Jane Smith" {...register('name')} />
              {errors.name && <p className="field-error">{errors.name.message}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="label">Job Title *</label>
              <input className="input" placeholder="Director of Finance" {...register('title')} />
              {errors.title && <p className="field-error">{errors.title.message}</p>}
            </div>

            {/* Organization */}
            <div>
              <label className="label">Organization *</label>
              <input className="input" placeholder="Contoso Ltd" {...register('organization')} />
              {errors.organization && <p className="field-error">{errors.organization.message}</p>}
            </div>

            {/* Industry */}
            <div>
              <label className="label">Industry *</label>
              <input className="input" placeholder="e.g. Healthcare, Manufacturing, Retail" {...register('industry')} />
              {errors.industry && <p className="field-error">{errors.industry.message}</p>}
            </div>

            {/* Workloads - multi-select pills */}
            <div>
              <label className="label">
                Workload(s) *{' '}
                <span className="text-gray-400 font-normal text-xs">select all that apply</span>
              </label>
              <div className="flex flex-wrap gap-2 mt-1">
                {workloads.map((w) => {
                  const active = selectedWorkloads.includes(w.id)
                  const color = WORKLOAD_COLORS[w.name] ?? '#616161'
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => toggleWorkload(w.id)}
                      className="px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-all"
                      style={
                        active
                          ? { backgroundColor: color, borderColor: color, color: '#fff' }
                          : { backgroundColor: '#fff', borderColor: '#D1D5DB', color: '#374151' }
                      }
                    >
                      {w.name}
                    </button>
                  )
                })}
              </div>
              {workloadError && (
                <p className="field-error">Please select at least one workload</p>
              )}
            </div>

            {/* LinkedIn */}
            <div>
              <label className="label">LinkedIn Profile URL</label>
              <input
                className="input"
                placeholder="https://www.linkedin.com/in/your-profile"
                {...register('linkedin_url')}
              />
              {errors.linkedin_url && <p className="field-error">{errors.linkedin_url.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
                {serverError}
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
