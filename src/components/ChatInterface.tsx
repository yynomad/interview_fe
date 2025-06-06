'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function ChatInterface() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 连接WebSocket
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5001'
    const newSocket = io(wsUrl)

    newSocket.on('connect', () => {
      console.log('WebSocket connected')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected')
      setConnected(false)
    })

    newSocket.on('conversation_history', (data) => {
      setMessages(data.messages || [])
    })

    newSocket.on('new_conversation', (data) => {
      setMessages([])
    })

    newSocket.on('conversation_updated', (data) => {
      setMessages(data.messages || [])
      setLoading(false)
    })

    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error)
      setLoading(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !socket || !connected) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    }

    setMessages([...messages, newMessage])
    socket.emit('request_answer', { message: input })
    setInput('')
    setLoading(true)
  }

  const clearConversation = () => {
    if (socket && connected) {
      socket.emit('new_conversation')
      setMessages([])
    }
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">面试对话</h2>
        <div className="flex items-center">
          <span className={`h-3 w-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span>{connected ? '已连接' : '未连接'}</span>
          <button 
            onClick={clearConversation}
            className="ml-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            清空对话
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            开始你的面试对话吧
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div 
                className={`inline-block max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block max-w-[80%] p-3 rounded-lg bg-gray-200 text-gray-800 rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入你的问题..."
            className="flex-1 p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!connected || loading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 disabled:bg-gray-400"
            disabled={!connected || !input.trim() || loading}
          >
            发送
          </button>
        </div>
      </form>
    </div>
  )
}
