export function translateEmploymentType(value: string): string {
  const map: Record<string, string> = {
    'full-time': 'Teljes munkaidő',
    'part-time': 'Részmunkaidő',
    contract: 'Szerződéses',
    internship: 'Gyakornoki'
  }
  return map[value] ?? value
}

export function translateWorkMode(value: string): string {
  const map: Record<string, string> = {
    onsite: 'Irodai',
    hybrid: 'Hibrid',
    remote: 'Távmunka'
  }
  return map[value] ?? value
}

export function translateJobStatus(value: string): string {
  const map: Record<string, string> = {
    draft: 'Tervezet',
    published: 'Publikált',
    closed: 'Lezárt'
  }
  return map[value] ?? value
}

export function translateApplicationStatus(value: string): string {
  const map: Record<string, string> = {
    new: 'Új',
    screening: 'Előszűrés',
    interview: 'Interjú',
    rejected: 'Elutasítva',
    offer: 'Ajánlat'
  }
  return map[value] ?? value
}

export function translateRole(value: string): string {
  const map: Record<string, string> = {
    jobseeker: 'Álláskereső',
    recruiter: 'Álláshirdető',
    admin: 'Admin',
    guest: 'Vendég'
  }
  return map[value] ?? value
}

export default {
  translateEmploymentType,
  translateWorkMode,
  translateJobStatus,
  translateApplicationStatus,
  translateRole
}
