export interface Credentials {
  email: string
  password: string
}

// Keys used for storage
const EMAIL_KEY = "auth_email"
const PASS_KEY = "auth_password"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

function setCookie(key: string, value: string) {
  document.cookie = `${key}=${encodeURIComponent(value)};path=/;max-age=${COOKIE_MAX_AGE}`
}

function getCookie(key: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function saveCredentials(email: string, password: string) {
  localStorage.setItem(EMAIL_KEY, email)
  localStorage.setItem(PASS_KEY, password)
  sessionStorage.setItem(EMAIL_KEY, email)
  sessionStorage.setItem(PASS_KEY, password)
  setCookie(EMAIL_KEY, email)
  setCookie(PASS_KEY, password)
}

export function getCredentials(): Credentials | null {
  const email =
    localStorage.getItem(EMAIL_KEY) ||
    sessionStorage.getItem(EMAIL_KEY) ||
    getCookie(EMAIL_KEY)

  const password =
    localStorage.getItem(PASS_KEY) ||
    sessionStorage.getItem(PASS_KEY) ||
    getCookie(PASS_KEY)

  if (email && password) return { email, password }
  return null
}

export function clearCredentials() {
  localStorage.removeItem(EMAIL_KEY)
  localStorage.removeItem(PASS_KEY)
  sessionStorage.removeItem(EMAIL_KEY)
  sessionStorage.removeItem(PASS_KEY)
  // Expire cookies
  document.cookie = `${EMAIL_KEY}=;path=/;max-age=0`
  document.cookie = `${PASS_KEY}=;path=/;max-age=0`
} 