import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { AuthError } from '@/types/auth'

// --- Step schemas ---

const schoolInfoSchema = z.object({
  schoolName: z.string().min(3, 'Nazwa szkoły musi mieć co najmniej 3 znaki'),
  address: z.string().optional(),
  contactEmail: z.string().email('Nieprawidłowy adres email'),
  contactPhone: z.string().optional(),
})

const adminInfoSchema = z.object({
  adminEmail: z.string().email('Nieprawidłowy adres email'),
  adminPassword: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
  confirmPassword: z.string().min(1, 'To pole jest wymagane'),
}).refine((d) => d.adminPassword === d.confirmPassword, {
  message: 'Hasła nie są zgodne',
  path: ['confirmPassword'],
})

type SchoolInfoData = z.infer<typeof schoolInfoSchema>
type AdminInfoData = z.infer<typeof adminInfoSchema>

interface FormState {
  schoolName: string
  address: string
  contactEmail: string
  contactPhone: string
  adminEmail: string
  adminPassword: string
  confirmPassword: string
}

const STEPS = ['Szkoła', 'Administrator', 'Gotowe'] as const
const TOTAL_STEPS = 3

// --- Step 1 ---
interface Step1Props {
  defaultValues: Partial<SchoolInfoData>
  onNext: (data: SchoolInfoData) => void
}

function Step1SchoolInfo({ defaultValues, onNext }: Step1Props) {
  const { t } = useTranslation()
  const { register, handleSubmit, formState: { errors } } = useForm<SchoolInfoData>({
    resolver: zodResolver(schoolInfoSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5" noValidate>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('auth.schoolName')} *</label>
        <input
          type="text"
          {...register('schoolName')}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.schoolName && <p className="mt-1 text-xs text-red-600">{errors.schoolName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('auth.address')}</label>
        <input
          type="text"
          {...register('address')}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('auth.contactEmail')} *</label>
        <input
          type="email"
          {...register('contactEmail')}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.contactEmail && <p className="mt-1 text-xs text-red-600">{errors.contactEmail.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('auth.contactPhone')}</label>
        <input
          type="tel"
          {...register('contactPhone')}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {t('auth.next')} →
      </button>
    </form>
  )
}

// --- Step 2 ---
interface Step2Props {
  defaultValues: Partial<AdminInfoData>
  onNext: (data: AdminInfoData) => void
  onBack: () => void
  isSubmitting: boolean
  serverError: string | null
}

function Step2AdminInfo({ defaultValues, onNext, onBack, isSubmitting, serverError }: Step2Props) {
  const { t } = useTranslation()
  const { register, handleSubmit, formState: { errors } } = useForm<AdminInfoData>({
    resolver: zodResolver(adminInfoSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5" noValidate>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('auth.email')} *</label>
        <input
          type="email"
          autoComplete="email"
          {...register('adminEmail')}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.adminEmail && <p className="mt-1 text-xs text-red-600">{errors.adminEmail.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('auth.password')} *</label>
        <input
          type="password"
          autoComplete="new-password"
          {...register('adminPassword')}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.adminPassword && <p className="mt-1 text-xs text-red-600">{errors.adminPassword.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">{t('auth.confirmPassword')} *</label>
        <input
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none"
        >
          ← {t('auth.back')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {isSubmitting ? t('auth.loading') : t('auth.signUp')}
        </button>
      </div>
    </form>
  )
}

// --- Step 3: Success ---
function Step3Success({ schoolName }: { schoolName: string }) {
  const navigate = useNavigate()

  return (
    <div className="text-center space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900">Konto zostało utworzone!</h2>
      <p className="text-sm text-gray-600">
        Szkoła <strong>{schoolName}</strong> jest gotowa do użycia.
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Przejdź do panelu →
      </button>
    </div>
  )
}

// --- Main component ---

export default function SchoolSignupPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const [formState, setFormState] = useState<FormState>({
    schoolName: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
  })

  const handleStep1Next = (data: SchoolInfoData) => {
    setFormState((prev) => ({ ...prev, ...data, address: data.address ?? '', contactPhone: data.contactPhone ?? '' }))
    setStep(2)
  }

  const handleStep2Submit = async (data: AdminInfoData) => {
    setServerError(null)
    setIsSubmitting(true)

    const merged = { ...formState, ...data }

    try {
      await authService.signupSchool({
        schoolName: merged.schoolName,
        address: merged.address,
        contactEmail: merged.contactEmail,
        contactPhone: merged.contactPhone,
        adminEmail: merged.adminEmail,
        adminPassword: merged.adminPassword,
      })
      setFormState((prev) => ({ ...prev, ...data }))
      setStep(3)
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        setServerError(err.message)
      } else {
        setServerError('Wystąpił błąd. Spróbuj ponownie.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Zarejestruj szkołę</h1>
          {step < 3 && (
            <p className="mt-1 text-sm text-gray-500">
              {t('auth.step')} {step} {t('auth.of')} {TOTAL_STEPS - 1}: {STEPS[step - 1]}
            </p>
          )}
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div className="mb-6 flex gap-2">
            {Array.from({ length: TOTAL_STEPS - 1 }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}

        {/* Steps */}
        {step === 1 && (
          <Step1SchoolInfo
            defaultValues={formState}
            onNext={handleStep1Next}
          />
        )}

        {step === 2 && (
          <Step2AdminInfo
            defaultValues={formState}
            onNext={handleStep2Submit}
            onBack={() => setStep(1)}
            isSubmitting={isSubmitting}
            serverError={serverError}
          />
        )}

        {step === 3 && <Step3Success schoolName={formState.schoolName} />}

        {/* Link back to login */}
        {step < 3 && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Masz już konto?{' '}
            <Link to="/" className="font-medium text-blue-600 hover:underline">
              Zaloguj się
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
