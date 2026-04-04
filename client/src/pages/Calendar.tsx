import { useState } from 'react'
import styles from './Calendar.module.css'

interface TimeSlot {
  id: string
  day: string
  date: string
  timeRange: string
  blockLabel: string
  currentHighBid: number
  bidderCount: number
}

const TIME_SLOTS: TimeSlot[] = [
  { id: 'mon-am', day: 'Monday', date: 'March 2, 2026', timeRange: '9:00 AM – 12:00 PM', blockLabel: 'Morning Block', currentHighBid: 0, bidderCount: 0 },
  { id: 'mon-pm', day: 'Monday', date: 'March 2, 2026', timeRange: '1:00 PM – 4:00 PM', blockLabel: 'Afternoon Block', currentHighBid: 0, bidderCount: 0 },
  { id: 'tue-am', day: 'Tuesday', date: 'March 3, 2026', timeRange: '9:00 AM – 12:00 PM', blockLabel: 'Morning Block', currentHighBid: 0, bidderCount: 0 },
  { id: 'tue-pm', day: 'Tuesday', date: 'March 3, 2026', timeRange: '1:00 PM – 4:00 PM', blockLabel: 'Afternoon Block', currentHighBid: 0, bidderCount: 0 },
  { id: 'thu-am', day: 'Thursday', date: 'March 5, 2026', timeRange: '9:00 AM – 12:00 PM', blockLabel: 'Morning Block', currentHighBid: 0, bidderCount: 0 },
  { id: 'thu-pm', day: 'Thursday', date: 'March 5, 2026', timeRange: '1:00 PM – 4:00 PM', blockLabel: 'Afternoon Block', currentHighBid: 0, bidderCount: 0 },
  { id: 'fri-am', day: 'Friday', date: 'March 6, 2026', timeRange: '9:00 AM – 12:00 PM', blockLabel: 'Morning Block', currentHighBid: 0, bidderCount: 0 },
  { id: 'fri-pm', day: 'Friday', date: 'March 6, 2026', timeRange: '1:00 PM – 4:00 PM', blockLabel: 'Afternoon Block', currentHighBid: 0, bidderCount: 0 },
]

export default function Calendar() {
  const [slots, setSlots] = useState<TimeSlot[]>(TIME_SLOTS)
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [bidAmount, setBidAmount] = useState('')

  const handleBid = () => {
    if (!selectedSlot || !bidAmount) {
      alert('Please select a time slot and enter a bid amount.')
      return
    }
    const amount = parseFloat(bidAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid bid amount.')
      return
    }
    const slot = slots.find((s) => s.id === selectedSlot)
    if (!slot) return
    if (amount <= slot.currentHighBid) {
      alert(`Your bid must be higher than the current high bid of $${slot.currentHighBid.toFixed(2)}.`)
      return
    }
    setSlots((prev) =>
      prev.map((s) =>
        s.id === selectedSlot
          ? { ...s, currentHighBid: amount, bidderCount: s.bidderCount + 1 }
          : s
      )
    )
    alert(`Bid of $${amount.toFixed(2)} submitted for ${slot.day} ${slot.timeRange}!`)
    setBidAmount('')
  }

  const selected = slots.find((s) => s.id === selectedSlot)

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <h1>Time Auction Calendar</h1>
        <p>Bid on weekly time blocks. The highest bidder secures access to each slot. 50% of all auction revenue funds Community Projects.</p>
      </div>

      <div className={styles.weeklyGoals}>
        <h2>Weekly Goals</h2>
        <p>Goals for each week are released every Sunday. The creator never commits to a specific time or place — only that weekly commitments will be completed by the end of the week.</p>
        <p className={styles.weeklyGoalsNote}>Check back each Sunday for the upcoming week's goals and priorities.</p>
      </div>

      <div className={styles.notice}>
        Time slots are auctioned weekly. The highest bidder secures access to the time block. 50% of all auction revenue funds Community Projects.
      </div>

      <div className={styles.weekLabel}>Week of March 2, 2026</div>

      <div className={styles.slotsGrid}>
        {slots.map((slot) => (
          <div
            key={slot.id}
            className={`${styles.slotCard} ${selectedSlot === slot.id ? styles.slotCardSelected : ''}`}
          >
            <div className={styles.slotDay}>{slot.day}</div>
            <div className={styles.slotDate}>{slot.date} — {slot.blockLabel}</div>
            <div className={styles.slotTime}>{slot.timeRange}</div>
            <div className={styles.slotMeta}>
              <div className={styles.slotMetaItem}>
                <span className={styles.slotMetaLabel}>High Bid</span>
                <span className={styles.slotMetaValue}>${slot.currentHighBid.toFixed(2)}</span>
              </div>
              <div className={styles.slotMetaItem}>
                <span className={styles.slotMetaLabel}>Bidders</span>
                <span className={styles.slotBidders}>{slot.bidderCount}</span>
              </div>
            </div>
            <button
              className={`${styles.selectBtn} ${selectedSlot === slot.id ? styles.selectBtnActive : ''}`}
              onClick={() => setSelectedSlot(slot.id)}
            >
              {selectedSlot === slot.id ? 'Selected' : 'Select Slot'}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.bidSection}>
        <h2>Place a Bid</h2>
        <p className={styles.bidDesc}>
          Select a time slot above, then enter your bid amount in USD. The highest bid at auction close wins the time block.
        </p>
        {selected && (
          <div className={styles.selectedSlotInfo}>
            <span>{selected.day} — {selected.timeRange}</span>
            <span>Current: ${selected.currentHighBid.toFixed(2)}</span>
          </div>
        )}
        <div className={styles.formGroup}>
          <label>Time Slot</label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className={styles.input}
          >
            <option value="">Select a time slot...</option>
            {slots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.day} — {slot.timeRange} (Current: ${slot.currentHighBid.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Bid Amount (USD)</label>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Enter bid amount in dollars"
            className={styles.input}
            min="0"
            step="1"
          />
        </div>
        <button onClick={handleBid} className={styles.bidBtn}>
          Submit Bid
        </button>
      </div>
    </div>
  )
}
