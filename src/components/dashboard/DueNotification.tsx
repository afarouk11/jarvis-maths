'use client'

import { useEffect } from 'react'

export function DueNotification({ dueCount }: { dueCount: number }) {
  useEffect(() => {
    if (dueCount === 0) return
    if (!('Notification' in window)) return

    if (Notification.permission === 'granted') {
      fire(dueCount)
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(p => {
        if (p === 'granted') fire(dueCount)
      })
    }
  }, [dueCount])

  return null
}

function fire(count: number) {
  new Notification('Studiq', {
    body: `You have ${count} topic${count > 1 ? 's' : ''} due for review. Keep your streak going!`,
    icon: '/favicon.ico',
  })
}
