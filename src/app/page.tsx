'use client'

import { useState, useEffect } from 'react'
import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-8">面试助手</h1>
        <ChatInterface />
      </div>
    </main>
  )
}
