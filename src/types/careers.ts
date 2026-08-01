export interface CareerIndexRecord {
  id: string
  title: string
  degreeType: string
  area: string
}

export interface CareersIndexPayload {
  institution: string
  total: number
  careers: CareerIndexRecord[]
}

export interface EducationCareerInstitution {
  id: string
  name: string
  short?: string
  logo?: string
}

export interface EducationCareerRecord {
  id: string
  title: string
  area: string
  degreeType: string
  modality: string
  duration: string
  cost: string
  institutionName: string
  institution: EducationCareerInstitution | null
}

export interface EducationCareersPayload {
  total: number
  careers: EducationCareerRecord[]
}
