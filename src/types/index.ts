export interface Workload {
  id: string
  name: string
  created_at: string
}

export interface Champion {
  id: string
  name: string
  title: string
  organization: string
  workload_id: string
  workload_ids: string[]
  image_url: string | null
  linkedin_url: string | null
  industry: string | null
  status: 'pending' | 'approved' | 'rejected'
  submitted_at: string
  edit_token?: string
  workloads?: Workload
}

export type ChampionSubmission = Omit<Champion, 'id' | 'status' | 'submitted_at' | 'workloads'>
