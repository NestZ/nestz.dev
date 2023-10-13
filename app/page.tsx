'use client'

import './globals.css'
import Typewriter from 'typewriter-effect';

export default function Home() {
  return (
    <main>
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-5xl font-mono">
        <Typewriter
          options={{
            strings: 'nestz.dev',
            cursor: '&#x2588',
            autoStart: true,
            loop: false,
          }}
        />
        </p>
      </div>
    </main>
  )
}
