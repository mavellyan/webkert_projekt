import { describe, expect, it } from 'vitest'
import { sanitizeText, validateEmail, validateFullName, validatePassword } from './validation'

describe('validation helpers', () => {
  it('accepts a valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull()
  })

  it('rejects an empty email', () => {
    expect(validateEmail('')).toBe('Email szükséges')
  })

  it('rejects an invalid email format', () => {
    expect(validateEmail('invalid-email')).toBe('Érvénytelen email formátum')
  })

  it('accepts a valid password', () => {
    expect(validatePassword('secret1')).toBeNull()
  })

  it('rejects an empty password', () => {
    expect(validatePassword('')).toBe('Jelszó szükséges')
  })

  it('rejects a short password', () => {
    expect(validatePassword('123')).toBe('A jelszó minimum 6 karakter hosszú')
  })

  it('accepts a valid full name', () => {
    expect(validateFullName('Nagy Anna')).toBeNull()
  })

  it('rejects a short full name', () => {
    expect(validateFullName('Al')).toBe('A név minimum 3 karakter hosszú kell, hogy legyen')
  })

  it('escapes HTML-sensitive characters', () => {
    expect(sanitizeText('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
  })

  it('leaves plain text unchanged apart from escaping rules', () => {
    expect(sanitizeText('JobFinder')).toBe('JobFinder')
  })
})
