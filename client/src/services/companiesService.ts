import { apiRequest } from './api'
import type { Company, CompanyInput } from '../types'

export const companiesService = {
  list(): Promise<Company[]> {
    return apiRequest<Company[]>('/companies')
  },

  create(payload: CompanyInput): Promise<Company> {
    return apiRequest<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  update(id: string, payload: Partial<CompanyInput>): Promise<Company> {
    return apiRequest<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  remove(id: string): Promise<void> {
    return apiRequest<void>(`/companies/${id}`, {
      method: 'DELETE'
    })
  }
}
