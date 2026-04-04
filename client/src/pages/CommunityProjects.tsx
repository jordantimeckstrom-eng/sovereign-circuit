import { useState } from 'react'
import styles from './CommunityProjects.module.css'

interface Project {
  id: string
  title: string
  description: string
  estimatedCost: number
  category: string
  votes: number
}

const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Community Learning Center',
    description: 'Build an open-access learning center with free workshops on financial literacy, digital skills, and creative arts for underserved neighborhoods.',
    estimatedCost: 12000,
    category: 'Education',
    votes: 24,
  },
  {
    id: 'proj-2',
    title: 'Neighborhood Health Screening Program',
    description: 'Organize quarterly mobile health screening events offering free blood pressure, glucose, and vision checks with local healthcare volunteers.',
    estimatedCost: 5000,
    category: 'Health',
    votes: 18,
  },
  {
    id: 'proj-3',
    title: 'Community Garden & Food Co-op',
    description: 'Transform vacant lots into community gardens and establish a food cooperative to provide fresh produce at cost to local families.',
    estimatedCost: 8000,
    category: 'Infrastructure',
    votes: 15,
  },
  {
    id: 'proj-4',
    title: 'Youth Arts & Music Program',
    description: 'Fund instruments, supplies, and mentorship for a youth arts and music program — giving young people a creative outlet and sense of purpose.',
    estimatedCost: 6500,
    category: 'Arts',
    votes: 12,
  },
  {
    id: 'proj-5',
    title: 'Open-Source Tech Hub',
    description: 'Establish a shared workspace with computers, internet access, and mentorship for community members learning software development and design.',
    estimatedCost: 15000,
    category: 'Technology',
    votes: 9,
  },
]

const CATEGORIES = ['Infrastructure', 'Education', 'Health', 'Arts', 'Technology', 'Other']

export default function CommunityProjects() {
  const [projects, setProjects] = useState<Project[]>(SEED_PROJECTS)
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down'>>({})
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('')
  const [category, setCategory] = useState('')

  const sortedProjects = [...projects].sort((a, b) => b.votes - a.votes)

  const handleVote = (projectId: string, direction: 'up' | 'down') => {
    const prev = userVotes[projectId]
    if (prev === direction) return

    setProjects((ps) =>
      ps.map((p) => {
        if (p.id !== projectId) return p
        let delta = direction === 'up' ? 1 : -1
        if (prev) delta *= 2
        return { ...p, votes: p.votes + delta }
      })
    )
    setUserVotes((v) => ({ ...v, [projectId]: direction }))
  }

  const handleSubmit = () => {
    if (!title.trim() || !description.trim() || !category) return
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      estimatedCost: parseFloat(estimatedCost) || 0,
      category,
      votes: 0,
    }
    setProjects((prev) => [...prev, newProject])
    setTitle('')
    setDescription('')
    setEstimatedCost('')
    setCategory('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Community Projects</h1>
        <p>Submit needs, vote on priorities, and shape where auction revenue is invested.</p>
      </div>

      <div className={styles.fundingBanner}>
        <div className={styles.fundingTitle}>Community Fund: 50% of Time Auction Revenue</div>
        <div className={styles.fundingAmount}>$0.00</div>
        <div className={styles.fundingNote}>Funded by auction proceeds</div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Submit a Project</h2>
        <div className={styles.submitForm}>
          <div className={styles.formGroup}>
            <label>Project Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project and its impact on the community"
              className={styles.textarea}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Estimated Cost (USD)</label>
            <input
              type="number"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="0.00"
              className={styles.input}
              min="0"
              step="100"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles.input}
            >
              <option value="">Select a category...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button onClick={handleSubmit} className={styles.submitBtn}>
            Submit Project
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Active Projects</h2>
        <div className={styles.projectsList}>
          {sortedProjects.map((project) => (
            <div key={project.id} className={styles.projectCard}>
              <div className={styles.projectTop}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <span className={styles.categoryBadge}>{project.category}</span>
              </div>
              <p className={styles.projectDesc}>{project.description}</p>
              <div className={styles.projectMeta}>
                <span>Estimated Cost: ${project.estimatedCost.toLocaleString()}</span>
                <span>{project.votes} vote{project.votes !== 1 ? 's' : ''}</span>
              </div>
              <div className={styles.projectBottom}>
                <div className={styles.voteControls}>
                  <button
                    className={`${styles.voteBtn} ${userVotes[project.id] === 'up' ? styles.voteBtnActive : ''}`}
                    onClick={() => handleVote(project.id, 'up')}
                  >
                    ▲
                  </button>
                  <span className={styles.voteCount}>{project.votes}</span>
                  <button
                    className={`${styles.voteBtn} ${userVotes[project.id] === 'down' ? styles.voteBtnActive : ''}`}
                    onClick={() => handleVote(project.id, 'down')}
                  >
                    ▼
                  </button>
                </div>
                <div className={styles.fundingStatus}>
                  <span className={styles.fundingLabel}>Funding</span>
                  <span className={styles.fundingValue}>${project.estimatedCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
