export type UserRole = 'guest' | 'jobseeker' | 'recruiter' | 'admin'

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship'
export type WorkMode = 'onsite' | 'hybrid' | 'remote'
export type JobStatus = 'draft' | 'published' | 'closed'
export type ApplicationStatus = 'new' | 'screening' | 'interview' | 'rejected' | 'offer'

export interface User {
  id: string
  email: string
  fullName: string
  role: Exclude<UserRole, 'guest'>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
}

export interface Skill {
  id: string
  name: string
}

export interface Company {
  id: string
  ownerUserId: string
  name: string
  description: string
  websiteUrl: string
  location: string
  createdAt: string
  updatedAt: string
}

export interface JobPost {
  id: string
  companyId: string
  categoryId: string
  title: string
  description: string
  employmentType: EmploymentType
  workMode: WorkMode
  city: string
  salaryMin: number
  salaryMax: number
  currency: string
  status: JobStatus
  expiresAt: string | null
  skillIds: string[]
  createdAt: string
  updatedAt: string
  companyName: string
  categoryName: string
}

export interface Application {
  id: string
  jobId: string
  applicantUserId: string
  companyId?: string
  cvUrl: string
  motivation: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
  jobTitle?: string
  applicantName?: string
}

export interface SavedJob {
  id: string
  userId: string
  jobId: string
  createdAt: string
  job: JobPost | null
}

export interface JobFilters {
  query: string
  categoryId: string
  workMode: '' | WorkMode
  sortBy: 'newest' | 'salary-desc' | 'salary-asc'
}

export interface CompanyInput {
  ownerUserId: string
  name: string
  description: string
  websiteUrl: string
  location: string
}

export interface JobInput {
  companyId: string
  categoryId: string
  title: string
  description: string
  employmentType: EmploymentType
  workMode: WorkMode
  city: string
  salaryMin: number
  salaryMax: number
  currency: string
  status: JobStatus
  expiresAt: string | null
  skillIds: string[]
}
