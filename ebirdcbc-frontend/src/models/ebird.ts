export type Checklist = {
  id: number
  project_id: number
  checklist_id: string
  location_name: number
  location_coords: number[]
  comments: string
  track_points: number[][] | null
  species: Species[]
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
  species_code: number
  comments: string | null
  count: number
  group_number: number
}
