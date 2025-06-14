'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface Conversation {
  id: string
  question: string
  answer?: string
  timestamp: string
}

export default function ChatInterface() {
  const [_socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 连接WebSocket
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5001'
    console.log('尝试连接WebSocket:', wsUrl)

    const newSocket = io(wsUrl, {
      transports: ['polling', 'websocket'], // 先尝试polling，再升级到websocket
      upgrade: true,
      rememberUpgrade: false, // 不记住升级，每次都重新协商
      timeout: 10000, // 减少超时时间
      forceNew: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    })

    newSocket.on('connect', () => {
      console.log('WebSocket connected successfully')
      setConnected(true)
      setConnectionError(null)
      // 清除重连定时器
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
    })

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      setConnected(false)
      setConnectionError(`连接断开: ${reason}`)
    })

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      setConnected(false)
      setConnectionError(`连接错误: ${error.message || '未知错误'}`)

      // 设置重连定时器
      if (!reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('尝试重新连接...')
          newSocket.connect()
          reconnectTimeoutRef.current = null
        }, 3000)
      }
    })

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts')
      setConnected(true)
      setConnectionError(null)
    })

    newSocket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error)
      setConnectionError(`重连失败: ${error.message || '未知错误'}`)
    })

    newSocket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed')
      setConnectionError('重连失败，请刷新页面重试')
    })

    newSocket.on('conversation_history', (data: { conversations?: Conversation[] }) => {
      console.log('收到历史对话:', data)
      if (data.conversations) {
        const formattedMessages = data.conversations.flatMap((conv: Conversation) => {
          const messages: Message[] = [{
            id: `q-${conv.id}`,
            role: 'user',
            content: conv.question,
            timestamp: new Date(conv.timestamp).getTime()
          }]
          if (conv.answer) {
            messages.push({
              id: `a-${conv.id}`,
              role: 'assistant',
              content: conv.answer,
              timestamp: new Date(conv.timestamp).getTime() + 1
            })
          }
          return messages
        })
        setMessages(formattedMessages)
      }
    })

    newSocket.on('new_conversation', (data: Conversation) => {
      console.log('新对话创建:', data)
      if (data.question) {
        const newMessage: Message = {
          id: `q-${data.id}`,
          role: 'user',
          content: data.question,
          timestamp: new Date(data.timestamp).getTime()
        }
        setMessages(prev => [...prev, newMessage])

        if (data.answer) {
          const answerMessage: Message = {
            id: `a-${data.id}`,
            role: 'assistant',
            content: data.answer,
            timestamp: new Date(data.timestamp).getTime() + 1
          }
          setMessages(prev => [...prev, answerMessage])
        }
      }
      setLoading(false)
    })

    newSocket.on('conversation_updated', (data: Conversation) => {
      console.log('对话更新:', data)
      if (data.answer) {
        const answerMessage: Message = {
          id: `a-${data.id}`,
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(data.timestamp).getTime() + 1
        }
        setMessages(prev => [...prev, answerMessage])
      }
      setLoading(false)
    })

    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error)
      setLoading(false)
    })

    setSocket(newSocket)

    return () => {
      // 清理定时器
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      // 断开连接
      newSocket.disconnect()
    }
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])



  const clearConversation = async () => {
    try {
      // 通过HTTP API清空对话历史
      const response = await fetch('/api/conversations', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        setMessages([])
        console.log('对话历史已清空')
      } else {
        console.error('清空对话失败:', response.status)
      }
    } catch (error) {
      console.error('清空对话时出错:', error)
      // 如果API调用失败，至少清空前端显示
      setMessages([])
    }
  }

  const handleReconnect = () => {
    if (_socket) {
      console.log('手动重新连接WebSocket...')
      setConnectionError(null)
      _socket.connect()
    }
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">面试对话</h2>
        <div className="flex items-center">
          <span className={`h-3 w-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className={connected ? 'text-green-600' : 'text-red-600'}>
            {connected ? '已连接' : '未连接'}
          </span>
          {connectionError && (
            <span className="ml-2 text-xs text-red-500" title={connectionError}>
              ⚠️
            </span>
          )}
          <button
            onClick={clearConversation}
            className="ml-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            清空对话
          </button>
        </div>
      </div>

      {connectionError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 mx-4 mt-2">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-700">{connectionError}</p>
              <p className="text-xs text-red-600 mt-1">
                请检查网络连接或刷新页面重试
              </p>
            </div>
            <button
              onClick={handleReconnect}
              className="ml-3 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              重新连接
            </button>
          </div>
        </div>
      )}
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            等待面试对话数据...
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
      

    </div>
  )
}
