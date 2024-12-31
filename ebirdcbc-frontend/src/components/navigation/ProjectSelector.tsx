'use client'

import { postServerRequest } from '@/networking/server_requests'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export const CURRENT_PROJECT_KEY = 'current_project'

export function ProjectSelector() {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)

  const router = useRouter()

  useEffect(() => {
    fetchProjects(router).then((projects) => setProjects(projects))
    setCurrentProject(getCurrentProject())
  }, [router])

  return (
    <div className='dropdown'>
      <div tabIndex={0} role='button' className='btn m-1'>
        Current Project: {currentProject?.name}
      </div>
      <ul
        tabIndex={0}
        className='dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow'
      >
        {projects.map((project) => (
          <li key={project.id}>
            <a
              onClick={() => {
                setProject(project)
                setCurrentProject(getCurrentProject())
                window.location.reload()
              }}
            >
              {project.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export type Project = {
  name: string
  id: number
  ebird_username: string
  // a lie, it's not encrypted on the client side but we need naming to be consistent
  ebird_encrypted_password?: string
}

export function getCurrentProject(): Project | null {
  const project = localStorage.getItem(CURRENT_PROJECT_KEY)
  return project ? JSON.parse(project) : null
}

export function setProject(project: Project) {
  localStorage.setItem(CURRENT_PROJECT_KEY, JSON.stringify(project))
}

export async function fetchProjects(router: AppRouterInstance) {
  const response = await postServerRequest('my_projects', {})
  if (response.ok) {
    return response.json()
  }
  router.push('/login')
  return []
}
