import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-soft-cyan-600 text-white hover:bg-soft-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold': variant === 'default',
            'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-300': variant === 'destructive',
            'border-2 border-soft-cyan-600 bg-white text-soft-cyan-700 hover:bg-soft-cyan-50 hover:border-soft-cyan-700 transition-all duration-300 font-semibold':
              variant === 'outline',
            'bg-soft-cyan-100 text-soft-cyan-800 hover:bg-soft-cyan-200 transition-all duration-300':
              variant === 'secondary',
            'hover:bg-soft-cyan-100 hover:text-soft-cyan-800 transition-all duration-300': variant === 'ghost',
            'text-soft-cyan-600 underline-offset-4 hover:underline hover:text-soft-cyan-700 transition-colors duration-300': variant === 'link',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }