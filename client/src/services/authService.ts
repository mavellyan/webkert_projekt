import { apiRequest } from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  role?: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    fullName: string
    role: string
  }
}

export async function loginUser(credentials: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  })
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function logoutUser(): Promise<void> {
  return apiRequest<void>('/auth/logout', {
    method: 'POST'
  })
}
