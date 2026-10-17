import { useState } from 'react'
import { X, Handshake, MapPin, Clock, DollarSign, FileCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { safeMeetPoints } from '../data/mockData'

export default function HandshakeModal() {
  const { showHandshakeModal, setShowHandshakeModal, handshakeListing, submitHandshake } = useApp()
  const listing = handshakeListing

  const [price, setPrice] = useState(listing?.price ? String(listing.price - 500) : '')
  const [meetPoint, setMeetPoint] = useState(safeMeetPoints[0])
  const [timeSlot, setTimeSlot] = useState('Sat · 2:00 – 4:00 PM')
  const [condition, setCondition] = useState('Inspect before payment')

  if (!showHandshakeModal) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    submitHandshake({
      listingTitle: listing?.title || 'Listing',
      listingImage: listing?.image || '',
      seller: listing?.seller || 'Seller',
      offerPrice: Number(price),
      meetPoint,
      timeSlot,
      conditions: [condition, 'Public Safe Exchange Zone only'],
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/45" onClick={() => setShowHandshakeModal(false)} />
      <div className="relative bg-divar-surface w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="h-1 bg-gradient-to-r from-divar-red via-divar-orange to-divar-yellow" />
        <div className="px-6 py-5 border-b border-divar-border-light flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Handshake className="w-5 h-5 text-divar-red" />
              <span className="text-xs font-extrabold text-divar-red uppercase tracking-wider">Handshake Offer</span>
            </div>
            <h2 className="font-bold text-divar-text text-lg">Structured deal — no chat needed</h2>
            <p className="text-xs text-divar-muted mt-1">Seller accepts, counters, or declines. Full audit trail.</p>
          </div>
          <button onClick={() => setShowHandshakeModal(false)} className="p-2 hover:bg-divar-bg rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {listing && (
          <div className="px-6 py-3 bg-divar-bg flex gap-3 items-center border-b border-divar-border-light">
            <img src={listing.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
            <p className="text-sm font-semibold text-divar-text line-clamp-2">{listing.title}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-divar-text-secondary uppercase flex items-center gap-1.5 mb-2">
              <DollarSign className="w-3.5 h-3.5 text-divar-red" /> Your offer (CAD)
            </label>
            <input
              type="number"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="dv-search w-full px-4 py-3 text-lg font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-divar-text-secondary uppercase flex items-center gap-1.5 mb-2">
              <MapPin className="w-3.5 h-3.5 text-divar-red" /> Safe meet point
            </label>
            <select
              value={meetPoint}
              onChange={(e) => setMeetPoint(e.target.value)}
              className="w-full border border-divar-border rounded-xl px-4 py-3 text-sm bg-white"
            >
              {safeMeetPoints.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-divar-text-secondary uppercase flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-divar-red" /> Time window
            </label>
            <select
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              className="w-full border border-divar-border rounded-xl px-4 py-3 text-sm bg-white"
            >
              {['Today · 4–6 PM', 'Sat · 2:00 – 4:00 PM', 'Sun · 11:00 AM', 'Mon · After 5 PM'].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-divar-text-secondary uppercase flex items-center gap-1.5 mb-2">
              <FileCheck className="w-3.5 h-3.5 text-divar-red" /> Condition
            </label>
            <input
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="dv-search w-full px-4 py-2.5 text-sm"
              placeholder="e.g. Inspect before payment"
            />
          </div>
          <button type="submit" className="w-full dv-btn-primary py-3.5 text-sm flex items-center justify-center gap-2">
            <Handshake className="w-5 h-5" /> Send Handshake Offer
          </button>
        </form>
      </div>
    </div>
  )
}
