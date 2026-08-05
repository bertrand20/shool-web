export default function StatCard({ icon: Icon, label, value, trend, trendLabel, color = 'blue', delay = 0 }) {
  const colorMap = {
    blue: 'bg-emerald-50 text-emerald-600',
    green: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-teal-50 text-teal-600',
  }

  const iconBg = colorMap[color] || colorMap.blue

  return (
    <div
      className={`panel-card flex items-start gap-4 animate-slide-up stagger-${delay}`}
    >
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-school-muted leading-tight">{label}</p>
        <p className="text-2xl font-bold text-school-text mt-0.5 leading-tight">{value}</p>
        {trend !== undefined && (
          <p className={`text-xs mt-1 leading-tight ${trend >= 0 ? 'text-school-success' : 'text-school-danger'}`}>
            {trend >= 0 ? '+' : ''}{trend}% {trendLabel || ''}
          </p>
        )}
      </div>
    </div>
  )
}
