import { useEffect, useRef, useState } from 'react'

function CountdownTimer({ endTime, compact = false, onExpire }) {
  const hasExpired = useRef(false)
  const [timeLeft, setTimeLeft] = useState(() => {
    const distance = Math.max(endTime - Date.now(), 0)
    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((distance / (1000 * 60)) % 60),
      seconds: Math.floor((distance / 1000) % 60),
      ended: distance <= 0,
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const distance = Math.max(endTime - Date.now(), 0)
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / (1000 * 60)) % 60),
        seconds: Math.floor((distance / 1000) % 60),
        ended: distance <= 0,
      })

      if (distance <= 0 && !hasExpired.current) {
        hasExpired.current = true
        onExpire?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime, onExpire])

  if (timeLeft.ended) {
    return <span className="time-badge ended">Auction Ended</span>
  }

  if (compact) {
    return (
      <span className="time-badge live">
        {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    )
  }

  return (
    <span className="time-badge live">
      {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
    </span>
  )
}

export default CountdownTimer
