export type Checklist = {
  id: number
  project_id: number
  checklist_id: string
  location_name: number
  location_coords: number[]
  comments: string
  track_points: number[][] | null
  species: Species[]
  datetime: string | null
  num_observers: number | null
  duration_hr: number | null
  distance_km: number | null
}

export type ChecklistResponse = {
  id: number
  project_id: number
  checklist_id: string
  location_name: number
  location_coords: number[]
  comments: string
  track_points: number[][] | null
}

export type Species = {
  id: number
  checklist_id: number
  species_code: string
  comments: string | null
  count: number
  group_number: number
  species_name: string
  taxon_order: number
}
