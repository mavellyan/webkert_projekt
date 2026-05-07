import { apiRequest } from './api'
import type { SavedJob } from '../types'

export interface SaveJobInput {
  userId: string
  jobId: string
}

export const savedJobsService = {
  listByUser(userId: string): Promise<SavedJob[]> {
    const params = new URLSearchParams({ userId })
    return apiRequest<SavedJob[]>(`/saved-jobs?${params.toString()}`)
  },

  create(payload: SaveJobInput): Promise<SavedJob> {
    return apiRequest<SavedJob>('/saved-jobs', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/saved-jobs/${id}`, {
      method: 'DELETE'
    })
  }
}
