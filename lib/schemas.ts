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

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput    = z.infer<typeof loginSchema>
