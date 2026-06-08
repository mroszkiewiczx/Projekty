import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { authService } from '@/services/authService'
import { AuthError } from '@/types/auth'

const joinSchema = z.object({
  inviteCode: z.string().min(1, 'Kod zaproszenia jest wymagany'),
  email: z.string().email('Nieprawidłowy adres email'),
  name: z.string().min(2, 'Imię i nazwisko jest wymagane'),
  password: z.string().min(8, 'Hasło musi mieć co najmniej 8 znaków'),
  confirmPassword: z.string().min(1, 'To pole jest wymagane'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Hasła nie są zgodne',
  path: ['confirmPassword'],
})

type JoinFormData = z.infer<typeof joinSchema>

export default function JoinTeacherPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JoinFormData>({
    resolver: zodResolver(joinSchema),
  })

  const onSubmit = async (data: JoinFormData) => {
    setServerError(null)
    try {
      await authService.signupTeacher({
        inviteCode: data.inviteCode,
        email: data.email,
        password: data.password,
        name: data.name,
      })
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        setServerError(err.message)
      } else {
        setServerError('Wystąpił błąd. Spróbuj ponownie.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Dołącz do szkoły</h1>
          <p className="mt-2 text-sm text-gray-500">Wpisz kod zaproszenia otrzymany od administratora</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
              {t('auth.inviteCode')} *
            </label>
            <input
              id="inviteCode"
              type="text"
              autoComplete="off"
              placeholder="np. INV-XXXXX-XXXXX"
              {...register('inviteCode')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.inviteCode && (
              <p className="mt-1 text-xs text-red-600">{errors.inviteCode.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              {t('auth.name')} *
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register('name')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('auth.email')} *
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {t('auth.password')} *
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              {t('auth.confirmPassword')} *
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {isSubmitting ? t('auth.loading') : 'Dołącz do szkoły'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Masz już konto?{' '}
          <Link to="/" className="font-medium text-blue-600 hover:underline">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  )
}
