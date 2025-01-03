'use client'

import { useState, useEffect } from 'react'
import {
  Project,
  setProject,
  fetchProjects,
} from '../navigation/ProjectSelector'
import { useRouter } from 'next/navigation'

export function ChooseProject() {
  const [projects, setProjects] = useState<Project[]>([])

  const router = useRouter()

  useEffect(() => {
    fetchProjects(router).then((projects) => {
      setProjects(projects)
      if (projects.length === 0) {
        router.push('/create-project')
      }
    })
  }, [router, projects])

  return (
    <div className='dropdown'>
      <div tabIndex={0} role='button' className='btn m-1'>
        Select Project:
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
                router.push('/')
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
