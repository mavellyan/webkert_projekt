import { apiRequest } from './api'
import type { User } from '../types'

export const usersService = {
  list(): Promise<User[]> {
    return apiRequest<User[]>('/users')
  },

  setActive(id: string, isActive: boolean): Promise<User> {
    return apiRequest<User>(`/users/${id}/active`, {
      method: 'PUT',
      body: JSON.stringify({ isActive })
    })
  }
}
