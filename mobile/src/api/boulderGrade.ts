import { apiFetch } from './apiClient'

type BoulderGradesResponse = {
  ok: true
  grades: string[]
}

export async function listBoulderGrades(): Promise<string[]> {
  const res = await apiFetch<BoulderGradesResponse>('/api/boulderGrade')
  return res.grades
}
