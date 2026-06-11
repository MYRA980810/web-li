import { z } from 'zod'

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/
const PHONE = /^\+[1-9]\d{6,14}$/

export const contactSchema = z
  .string()
  .min(1, 'El campo es requerido')
  .refine((v) => EMAIL.test(v) || PHONE.test(v), {
    message: 'Ingresá un email válido o un teléfono en formato internacional (+521234567890)',
  })

export const registerSchema = z.object({
  contact:   contactSchema,
  password:  z.string().min(8, 'Mínimo 8 caracteres').max(100),
  firstName: z.string().min(1, 'El nombre es requerido').max(100),
  lastName:  z.string().min(1, 'El apellido es requerido').max(100),
  role:      z.enum(['SELLER', 'BUYER']),
})

export const verifyOtpSchema = z.object({
  pendingToken: z.string().min(1),
  code:         z.string().length(6, 'El código debe tener 6 dígitos'),
})

export const loginSchema = z.object({
  contact:  contactSchema,
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

export const forgotPasswordSchema = z.object({
  contact: contactSchema,
})

export const verifyResetCodeSchema = z.object({
  pendingToken: z.string().min(1),
  code:         z.string().length(6, 'El código debe tener 6 dígitos'),
})

export const resetPasswordSchema = z.object({
  resetToken:      z.string().min(1),
  newPassword:     z.string().min(8, 'Mínimo 8 caracteres').max(100),
  confirmPassword: z.string().min(8).max(100),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type RegisterInput        = z.infer<typeof registerSchema>
export type LoginInput           = z.infer<typeof loginSchema>
export type ForgotPasswordInput  = z.infer<typeof forgotPasswordSchema>
export type VerifyResetCodeInput = z.infer<typeof verifyResetCodeSchema>
export type ResetPasswordInput   = z.infer<typeof resetPasswordSchema>

export const createStoreSchema = z.object({
  name:        z.string().min(1, 'El nombre es requerido').max(255),
  slug:        z.string().min(1, 'El identificador es requerido').max(255)
                .regex(
                  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                  'Solo minúsculas, números y guiones (ej: mi-tienda-live)',
                ),
  description: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
  logoUrl:     z.string().url('URL de logo inválida').max(500).optional(),
})

export type CreateStoreInput = z.infer<typeof createStoreSchema>

export const createProductSchema = z.object({
  name:        z.string().min(1, 'El nombre es requerido').max(255),
  categoryId:  z.string().uuid('Seleccioná una categoría válida'),
  description: z.string().max(2000).optional(),
  basePrice:   z.coerce
                 .number({ message: 'El precio debe ser un número' })
                 .min(0.01, 'El precio debe ser mayor a 0'),
  currency:    z.string().max(3).default('MXN'),
  stock:       z.coerce.number().int().min(0).default(0),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
