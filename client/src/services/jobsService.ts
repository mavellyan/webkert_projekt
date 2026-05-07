import { apiRequest } from './api'
import type { JobFilters, JobInput, JobPost } from '../types'

export const jobsService = {
  list(filters: JobFilters): Promise<JobPost[]> {
    const params = new URLSearchParams()

    if (filters.query.trim()) {
      params.set('q', filters.query.trim())
    }

    if (filters.categoryId) {
      params.set('categoryId', filters.categoryId)
    }

    if (filters.workMode) {
      params.set('workMode', filters.workMode)
    }

    params.set('sortBy', filters.sortBy)

    return apiRequest<JobPost[]>(`/jobs?${params.toString()}`)
  },

  getById(id: string): Promise<JobPost> {
    return apiRequest<JobPost>(`/jobs/${id}`)
  },

  create(payload: JobInput): Promise<JobPost> {
    return apiRequest<JobPost>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  update(id: string, payload: JobInput): Promise<JobPost> {
    return apiRequest<JobPost>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/jobs/${id}`, {
      method: 'DELETE'
    })
  }
}
