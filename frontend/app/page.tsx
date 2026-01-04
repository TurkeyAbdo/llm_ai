'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  const [files, setFiles] = useState<Array<{ id: string; name: string }>>([])
  const [activeFileIds, setActiveFileIds] = useState<Set<string>>(new Set())

  // Fetch files on mount
  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:8000/files')
      const data = await response.json()
      setFiles(data)
    } catch (error) {
      console.error('Error fetching files:', error)
    }
  }

  const handleFileUpload = () => {
    // Refresh file list after upload
    fetchFiles()
  }

  const toggleFileActive = (fileId: string) => {
    setActiveFileIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#ffffff',
  }

  return (
    <div style={containerStyle}>
      <Sidebar
        files={files}
        activeFileIds={activeFileIds}
        onFileUpload={handleFileUpload}
        onToggleFileActive={toggleFileActive}
      />
      <ChatInterface activeFileIds={Array.from(activeFileIds)} />
    </div>
  )
}
