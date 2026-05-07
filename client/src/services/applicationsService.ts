import { apiRequest } from './api'
import type { Application, ApplicationStatus } from '../types'

export interface ApplicationInput {
  jobId: string
  applicantUserId: string
  cvUrl: string
  motivation: string
}

export const applicationsService = {
  list(companyId?: string): Promise<Application[]> {
    if (companyId) {
      const params = new URLSearchParams({ companyId })
      return apiRequest<Application[]>(`/applications?${params.toString()}`)
    }

    return apiRequest<Application[]>('/applications')
  },

  create(payload: ApplicationInput): Promise<Application> {
    return apiRequest<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  updateStatus(id: string, status: ApplicationStatus): Promise<Application> {
    return apiRequest<Application>(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  }
}
