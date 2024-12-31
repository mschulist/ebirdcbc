'use client'

import { useEffect, useState } from 'react'
import {
  getCurrentProject,
  Project,
  setProject,
} from '../navigation/ProjectSelector'
import { ProjectInfo } from './ProjectInfo'
import { postServerRequest } from '@/networking/server_requests'
import { AddTripReport } from './AddTripReport'

export function ManageProject() {
  const [project, setProject] = useState<Project | null>(null)

  useEffect(() => {
    const project = getCurrentProject()
    if (project) {
      setProject(project)
    }
  }, [])

  return (
    <div className='h-full flex justify-evenly gap-16 p-16'>
      {project && (
        <ProjectInfo project={project} onProjectChange={updateProject} />
      )}
      <div className='divider divider-horizontal h-5/6'></div>
      <AddTripReport />
    </div>
  )
}

async function updateProject(project: Project) {
  const projectId = project.id
  const response = await postServerRequest(
    `update_project?project_id=${projectId}`,
    project
  )
  if (response.status !== 200) {
    return false
  }
  project.ebird_encrypted_password = ''
  setProject(project)
  return true
}
