'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import Confetti from 'react-confetti'

interface ConfettiContextType {
  showConfetti: () => void
  hideConfetti: () => void
}

const ConfettiContext = createContext<ConfettiContextType | undefined>(undefined)

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const [show, setShow] = useState(false)

  const showConfetti = () => {
    setShow(true)
    setTimeout(() => setShow(false), 3000)
  }

  const hideConfetti = () => {
    setShow(false)
  }

  return (
    <ConfettiContext.Provider value={{ showConfetti, hideConfetti }}>
      {children}
      {show && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
    </ConfettiContext.Provider>
  )
}

export function useConfetti() {
  const context = useContext(ConfettiContext)
  if (context === undefined) {
    throw new Error('useConfetti must be used within a ConfettiProvider')
  }
  return context
}
