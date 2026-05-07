import { apiRequest } from './api'
import type { Category, Skill } from '../types'

export const metadataService = {
  listCategories(): Promise<Category[]> {
    return apiRequest<Category[]>('/categories')
  },

  listSkills(): Promise<Skill[]> {
    return apiRequest<Skill[]>('/skills')
  }
}
