'use client'

import { useState, useRef } from 'react'

interface File {
  id: string
  name: string
}

interface SidebarProps {
  files: File[]
  activeFileIds: Set<string>
  onFileUpload: () => void
  onToggleFileActive: (fileId: string) => void
}

export default function Sidebar({
  files,
  activeFileIds,
  onFileUpload,
  onToggleFileActive,
}: SidebarProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sidebarStyle: React.CSSProperties = {
    width: '320px',
    borderRight: '1px solid #e8eaed',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#fafafa',
    overflowY: 'auto',
  }

  const headerStyle: React.CSSProperties = {
    padding: '20px 16px',
    borderBottom: '1px solid #e8eaed',
    backgroundColor: '#ffffff',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 500,
    color: '#202124',
    marginBottom: '4px',
  }

  const uploadAreaStyle: React.CSSProperties = {
    border: '2px dashed #dadce0',
    borderRadius: '8px',
    padding: '24px 16px',
    textAlign: 'center',
    margin: '16px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }

  const filesSectionStyle: React.CSSProperties = {
    flex: 1,
    padding: '8px',
    overflowY: 'auto',
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#5f6368',
    padding: '8px 16px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }

  const fileItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    margin: '4px 8px',
    borderRadius: '4px',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }

  const checkboxStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    marginRight: '12px',
    cursor: 'pointer',
  }

  const fileNameStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#202124',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, TXT, or DOCX file')
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        let errorMessage = 'Upload failed'
        try {
          const error = await response.json()
          errorMessage = error.detail || errorMessage
        } catch {
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      await response.json()
      onFileUpload()
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        alert('Failed to connect to the server. Please make sure the backend is running on http://localhost:8000')
      } else {
        alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div style={sidebarStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>NexusMind</div>
        <div style={{ fontSize: '12px', color: '#5f6368' }}>Sources</div>
      </div>

      <div
        style={uploadAreaStyle}
        onClick={() => fileInputRef.current?.click()}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#1a73e8'
          e.currentTarget.style.backgroundColor = '#f8f9fa'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#dadce0'
          e.currentTarget.style.backgroundColor = '#ffffff'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx,.doc"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        {isUploading ? (
          <div>
            <div style={{ fontSize: '14px', color: '#5f6368', marginBottom: '4px' }}>
              Uploading...
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '14px', color: '#1a73e8', marginBottom: '4px', fontWeight: 500 }}>
              + Upload Document
            </div>
            <div style={{ fontSize: '12px', color: '#80868b' }}>
              PDF, TXT, or DOCX
            </div>
          </div>
        )}
      </div>

      <div style={filesSectionStyle}>
        <div style={sectionTitleStyle}>
          Documents ({files.length})
        </div>
        {files.length === 0 ? (
          <div style={{ 
            color: '#80868b', 
            fontSize: '13px', 
            padding: '16px',
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            No documents uploaded yet
          </div>
        ) : (
          <div>
            {files.map((file) => (
              <div
                key={file.id}
                style={fileItemStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f3f4'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff'
                }}
                onClick={() => onToggleFileActive(file.id)}
              >
                <input
                  type="checkbox"
                  checked={activeFileIds.has(file.id)}
                  onChange={() => onToggleFileActive(file.id)}
                  onClick={(e) => e.stopPropagation()}
                  style={checkboxStyle}
                />
                <span style={fileNameStyle} title={file.name}>{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

