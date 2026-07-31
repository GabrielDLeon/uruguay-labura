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
