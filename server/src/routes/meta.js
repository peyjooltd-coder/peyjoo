import { Router } from 'express'

const router = Router()

router.get('/bootstrap', (req, res) => {
  res.json({
    regions: [
      'All Greater Vancouver',
      'Vancouver',
      'Burnaby',
      'Surrey',
      'Richmond',
      'North Vancouver',
      'Coquitlam',
      'New Westminster',
    ],
    safeMeetPoints: [
      'Metrotown SkyTrain — Safe Exchange Zone',
      'Brentwood Town Centre — Partner Café',
      'Vancouver Police — Community Policing Centre',
      'Richmond IKEA — Parking Lot Zone B',
      'Coquitlam City Hall — Front plaza',
    ],
    dashboardStats: {
      totalViews: 12840,
      viewsChange: '+18%',
      inquiries: 94,
      inquiriesChange: '+12%',
      conversionRate: 4.2,
      conversionChange: '+0.8%',
      revenue: 12450,
      revenueChange: '+24%',
    },
    recentActivity: [
      { type: 'inquiry', text: 'New Handshake Offer on Tesla Model 3', time: '12 min ago' },
      { type: 'save', text: 'Coal Harbour condo saved 8 times today', time: '1h ago' },
      { type: 'view', text: 'Listing views up 34% this week', time: '3h ago' },
      { type: 'boost', text: 'Smart Boost campaign completed — 2.1k impressions', time: 'Yesterday' },
    ],
  })
})

export default router
