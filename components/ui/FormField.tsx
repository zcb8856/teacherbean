'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

// 表单字段包装器
export interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  description?: string
  children: React.ReactNode
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  description,
  children,
  className
}) => {
  const fieldId = React.useId()

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}

      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': error ? `${fieldId}-error` : undefined,
          'aria-invalid': error ? 'true' : 'false',
          className: cn(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            (children as React.ReactElement).props.className
          )
        })}

        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-4 w-4 text-red-500" />
          </div>
        )}
      </div>

      {error && (
        <p
          id={`${fieldId}-error`}
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

// 增强的输入组件
export interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  description?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  error,
  description,
  leftIcon,
  rightIcon,
  className,
  required,
  ...props
}) => {
  return (
    <FormField
      label={label}
      error={error}
      description={description}
      required={required}
    >
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-4 w-4 text-gray-400">{leftIcon}</div>
          </div>
        )}

        <input
          {...props}
          className={cn(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
            leftIcon && 'pl-10',
            (rightIcon || error) && 'pr-10',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
        />

        {rightIcon && !error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-4 w-4 text-gray-400">{rightIcon}</div>
          </div>
        )}
      </div>
    </FormField>
  )
}

// 增强的文本域组件
export interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  description?: string
  showCharCount?: boolean
  maxLength?: number
}

export const EnhancedTextarea: React.FC<EnhancedTextareaProps> = ({
  label,
  error,
  description,
  showCharCount,
  maxLength,
  className,
  required,
  value,
  ...props
}) => {
  const currentLength = typeof value === 'string' ? value.length : 0

  return (
    <FormField
      label={label}
      error={error}
      description={description}
      required={required}
    >
      <div className="relative">
        <textarea
          {...props}
          value={value}
          maxLength={maxLength}
          className={cn(
            'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
        />

        {showCharCount && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {currentLength}{maxLength && `/${maxLength}`}
          </div>
        )}
      </div>
    </FormField>
  )
}

// 选择框组件
export interface EnhancedSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  description?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
}

export const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  label,
  error,
  description,
  options,
  placeholder,
  className,
  required,
  ...props
}) => {
  return (
    <FormField
      label={label}
      error={error}
      description={description}
      required={required}
    >
      <select
        {...props}
        className={cn(
          'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  )
}

// 复选框组件
export interface EnhancedCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
  error?: string
}

export const EnhancedCheckbox: React.FC<EnhancedCheckboxProps> = ({
  label,
  description,
  error,
  className,
  ...props
}) => {
  const fieldId = React.useId()

  return (
    <div className="space-y-2">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            {...props}
            id={fieldId}
            type="checkbox"
            className={cn(
              'h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500',
              error && 'border-red-300',
              className
            )}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={fieldId} className="font-medium text-gray-700">
            {label}
          </label>
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}