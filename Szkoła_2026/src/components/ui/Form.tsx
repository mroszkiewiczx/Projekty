import { forwardRef, FormHTMLAttributes } from 'react'
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form'
import { cn } from '@/lib/cn'

interface FormProps<T extends FieldValues> extends FormHTMLAttributes<HTMLFormElement> {
  form: UseFormReturn<T>
}

const Form = forwardRef<HTMLFormElement, FormProps<any>>(
  ({ form, className, children, ...props }, ref) => (
    <FormProvider {...form}>
      <form ref={ref} className={cn('space-y-4', className)} {...props}>
        {children}
      </form>
    </FormProvider>
  )
)

Form.displayName = 'Form'

interface FormFieldProps extends FormHTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  required?: boolean
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, required, children, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-1', className)} {...props}>
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
)

FormField.displayName = 'FormField'

interface FormGroupProps extends FormHTMLAttributes<HTMLDivElement> {
  columns?: number
}

const FormGroup = forwardRef<HTMLDivElement, FormGroupProps>(
  ({ className, columns = 1, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'grid gap-4',
        {
          'grid-cols-1': columns === 1,
          'grid-cols-2': columns === 2,
          'grid-cols-3': columns === 3,
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

FormGroup.displayName = 'FormGroup'

export { Form, FormField, FormGroup }
