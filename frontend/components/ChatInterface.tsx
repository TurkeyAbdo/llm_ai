'use client'

import { useState, useRef, useEffect } from 'react'

interface ChatInterfaceProps {
  activeFileIds: string[]
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]  // Sources used for assistant messages
}

export default function ChatInterface({ activeFileIds }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  }

  const headerStyle: React.CSSProperties = {
    padding: '16px 24px',
    borderBottom: '1px solid #e8eaed',
    backgroundColor: '#ffffff',
  }

  const pillStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    borderRadius: '16px',
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    fontSize: '13px',
    fontWeight: 500,
  }

  const messagesContainerStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    backgroundColor: '#fafafa',
  }

  const messageWrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '24px',
    alignItems: 'flex-start',
  }

  const messageBubbleWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    maxWidth: '70%',
  }

  const messageStyle = (role: 'user' | 'assistant'): React.CSSProperties => ({
    padding: '12px 16px',
    borderRadius: '18px',
    fontSize: '14px',
    lineHeight: '1.6',
    backgroundColor: role === 'user' ? '#1a73e8' : '#ffffff',
    color: role === 'user' ? '#ffffff' : '#202124',
    border: role === 'assistant' ? '1px solid #e8eaed' : 'none',
    boxShadow: role === 'assistant' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
    flex: 1,
  })

  const citationButtonStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '1px solid #dadce0',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#5f6368',
    flexShrink: 0,
    marginTop: '4px',
    transition: 'all 0.2s',
  }

  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '100%',
    left: '0',
    marginBottom: '8px',
    padding: '12px 16px',
    backgroundColor: '#202124',
    color: '#ffffff',
    borderRadius: '8px',
    fontSize: '13px',
    lineHeight: '1.5',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: '200px',
    maxWidth: '300px',
  }

  const tooltipArrowStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: '16px',
    width: '0',
    height: '0',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #202124',
  }

  const citationItemStyle: React.CSSProperties = {
    padding: '4px 0',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  }

  const citationItemLastStyle: React.CSSProperties = {
    padding: '4px 0',
    borderBottom: 'none',
  }

  const inputContainerStyle: React.CSSProperties = {
    padding: '16px 24px',
    borderTop: '1px solid #e8eaed',
    backgroundColor: '#ffffff',
  }

  const inputWrapperStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
    maxWidth: '900px',
    margin: '0 auto',
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #dadce0',
    borderRadius: '24px',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'none',
    minHeight: '44px',
    maxHeight: '120px',
    lineHeight: '1.5',
  }

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    backgroundColor: '#1a73e8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.6 : 1,
    transition: 'opacity 0.2s',
    height: '44px',
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          active_file_ids: activeFileIds,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response,
        sources: data.sources_used || []
      }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please make sure the backend is running and try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Citation button component
  const CitationButton = ({ sources }: { sources: string[] }) => {
    const [showTooltip, setShowTooltip] = useState(false)
    const buttonRef = useRef<HTMLDivElement>(null)

    if (!sources || sources.length === 0) return null

    return (
      <div
        ref={buttonRef}
        style={{ position: 'relative' }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div
          style={{
            ...citationButtonStyle,
            backgroundColor: showTooltip ? '#f1f3f4' : '#ffffff',
            borderColor: showTooltip ? '#1a73e8' : '#dadce0',
            color: showTooltip ? '#1a73e8' : '#5f6368',
          }}
        >
          {sources.length}
        </div>
        {showTooltip && (
          <div style={tooltipStyle}>
            <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Sources
            </div>
            {sources.map((source, idx) => (
              <div
                key={idx}
                style={idx < sources.length - 1 ? citationItemStyle : citationItemLastStyle}
              >
                {source}
              </div>
            ))}
            <div style={tooltipArrowStyle} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={pillStyle}>
          {activeFileIds.length} {activeFileIds.length === 1 ? 'source' : 'sources'} active
        </div>
      </div>

      <div style={messagesContainerStyle}>
        {messages.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              color: '#5f6368',
              fontSize: '14px',
              marginTop: '120px',
            }}
          >
            <div style={{ fontSize: '18px', marginBottom: '8px', color: '#202124' }}>
              Start a conversation
            </div>
            <div>Ask questions about your documents</div>
          </div>
        )}
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                ...messageWrapperStyle,
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={messageBubbleWrapperStyle}>
                {message.role === 'assistant' && (
                  <CitationButton sources={message.sources || []} />
                )}
                <div style={messageStyle(message.role)}>{message.content}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div style={inputContainerStyle}>
        <div style={inputWrapperStyle}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your documents..."
            style={inputStyle}
            disabled={isLoading}
            rows={1}
          />
          <button onClick={handleSend} style={buttonStyle} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

