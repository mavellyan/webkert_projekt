export function validateEmail(value: string): string | null {
  if (!value) {
    return 'Email szükséges'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'Érvénytelen email formátum'
  }

  return null
}

export function validatePassword(value: string): string | null {
  if (!value) {
    return 'Jelszó szükséges'
  }

  if (value.length < 6) {
    return 'A jelszó minimum 6 karakter hosszú'
  }

  return null
}

export function validateFullName(value: string): string | null {
  if (!value) {
    return 'Teljes név szükséges'
  }

  if (value.length < 3) {
    return 'A név minimum 3 karakter hosszú kell, hogy legyen'
  }

  return null
}

export function sanitizeText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
