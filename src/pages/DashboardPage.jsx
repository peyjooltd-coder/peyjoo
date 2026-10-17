import { useEffect } from 'react'
import {
  Eye, MessageSquare, TrendingUp, DollarSign, ArrowUpRight, BarChart3, Bell, Plus,
  LayoutDashboard, Heart,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { dashboardStats, recentActivity } from '../data/mockData'
import SavedPanel from '../components/SavedPanel'
import DashboardChatPanel from '../components/DashboardChatPanel'

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'saved', label: 'Saved', icon: Heart },
]

export default function DashboardPage() {
  const {
    myListings, setShowPostModal, setView, view,
    dashboardTab, setDashboardTab, openDashboard, savedIds, compareIds, chatUnreadCount,
  } = useApp()

  useEffect(() => {
    if (view === 'saved') setDashboardTab('saved')
  }, [view, setDashboardTab])

  const sellerRows = myListings.filter((l) => l.status === 'active').slice(0, 5)

  const stats = [
    { label: 'Total views', value: dashboardStats.totalViews.toLocaleString(), change: dashboardStats.viewsChange, icon: Eye },
    { label: 'Inquiries', value: dashboardStats.inquiries, change: dashboardStats.inquiriesChange, icon: MessageSquare },
    { label: 'Conversion', value: `${dashboardStats.conversionRate}%`, change: dashboardStats.conversionChange, icon: TrendingUp },
    { label: 'Est. revenue', value: `$${dashboardStats.revenue.toLocaleString()}`, change: dashboardStats.revenueChange, icon: DollarSign },
  ]

  return (
    <div className="space-y-6 animate-fade-up max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-divar-text">Dashboard</h1>
          <p className="text-sm text-divar-muted mt-1">
            <span className="text-divar-red font-semibold">Pro Business</span> · Stats, saved ads & alerts
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setView('pro')} className="dv-btn-outline px-4 py-2.5 text-sm">Upgrade</button>
          <button type="button" onClick={() => setShowPostModal(true)} className="dv-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
            <Plus className="w-4 h-4" /> New ad
          </button>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white border border-divar-border rounded-xl max-w-2xl overflow-x-auto scrollbar-thin">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setDashboardTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
              dashboardTab === id ? 'bg-divar-red text-white' : 'text-divar-text-secondary hover:bg-divar-bg'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === 'messages' && chatUnreadCount > 0 && (
              <span className={`min-w-[18px] h-5 text-[10px] font-bold rounded-full flex items-center justify-center px-1 ${
                dashboardTab === id ? 'bg-white text-divar-red' : 'bg-divar-orange text-white'
              }`}>
                {chatUnreadCount}
              </span>
            )}
            {id === 'saved' && (savedIds.size > 0 || compareIds.length > 0) && (
              <span className={`min-w-[18px] h-5 text-[10px] font-bold rounded-full flex items-center justify-center px-1 ${
                dashboardTab === id ? 'bg-white text-divar-red' : 'bg-divar-orange text-white'
              }`}>
                {savedIds.size + compareIds.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {dashboardTab === 'messages' ? (
        <DashboardChatPanel />
      ) : dashboardTab === 'saved' ? (
        <SavedPanel />
      ) : (
        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, change, icon: Icon }) => (
              <div key={label} className="dv-card p-5">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-lg bg-divar-red-soft flex items-center justify-center">
                    <Icon className="w-4 h-4 text-divar-red" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />{change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-divar-text mt-3">{value}</p>
                <p className="text-xs text-divar-muted mt-1">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 dv-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-divar-text flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-divar-red" /> Performance
                </h2>
                <select className="text-xs border border-divar-border rounded-lg px-3 py-1.5 bg-divar-bg">
                  <option>Last 30 days</option>
                </select>
              </div>
              <div className="h-44 flex items-end gap-1.5">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-divar-red/80 hover:bg-divar-red rounded-t-md transition-colors min-h-[8px]"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="dv-card p-6">
              <h2 className="font-bold text-divar-text flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-divar-orange" /> Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 0 ? 'bg-divar-red' : 'bg-divar-border'}`} />
                    <div>
                      <p className="text-divar-text">{a.text}</p>
                      <p className="text-[11px] text-divar-muted mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dv-card overflow-hidden">
            <div className="px-6 py-4 border-b border-divar-border-light flex justify-between items-center bg-divar-surface-2">
              <h2 className="font-bold text-divar-text">Your ads</h2>
              <button type="button" onClick={() => setView('my-ads')} className="text-xs font-bold text-divar-red hover:underline">
                Manage all →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead className="bg-divar-bg text-divar-text-secondary text-xs">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold">Listing</th>
                    <th className="text-left px-4 py-3 font-semibold">Views</th>
                    <th className="text-left px-4 py-3 font-semibold">Saves</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sellerRows.map((l) => (
                    <tr key={l.id} className="border-t border-divar-border-light hover:bg-divar-bg/50">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img src={l.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <span className="font-medium text-divar-text line-clamp-1 max-w-[200px]">{l.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{l.views.toLocaleString()}</td>
                      <td className="px-4 py-3">{l.saves}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {l.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openDashboard('saved')}
            className="w-full dv-card p-5 flex items-center justify-between hover:border-divar-red/30 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-divar-red fill-divar-red" />
              <div>
                <p className="font-bold text-divar-text">Saved & compare</p>
                <p className="text-xs text-divar-muted">{savedIds.size} saved · {compareIds.length} in compare</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-divar-red">Open →</span>
          </button>
        </div>
      )}
    </div>
  )
}
