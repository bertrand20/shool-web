import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import EmptyState from './EmptyState'
import { useI18n } from '../i18n/context'

const statusBadge = (status) => {
  const map = {
    Active: 'badge-active',
    Inactive: 'badge-inactive',
    Graduated: 'badge-warning',
    Transferred: 'badge-danger',
  }
  return <span className={map[status] || 'badge-inactive'}>{status}</span>
}

export default function StudentTable({
  students,
  pagination,
  onPageChange,
  onSearch,
  searchValue,
  onRowClick,
}) {
  const { t } = useI18n()

  if (!students || students.length === 0) {
    return (
      <EmptyState
        title={t('noStudentsFound')}
        description={t('studentTable.emptyHint')}
      />
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t('searchStudents')}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
        <p className="text-xs text-school-muted">
          {pagination.total} {pagination.total !== 1 ? t('students') : t('student')} {t('total')}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-school-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80 border-b border-school-border">
              <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider">{t('name')}</th>
              <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider hidden sm:table-cell">{t('email')}</th>
              <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider hidden md:table-cell">{t('class')}</th>
              <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider hidden lg:table-cell">{t('guardian')}</th>
              <th className="text-left px-4 py-3 font-medium text-school-muted text-xs uppercase tracking-wider">{t('status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-school-border/60">
            {students.map((s) => (
              <tr
                key={s.id}
                onClick={() => onRowClick && onRowClick(s)}
                className="table-row-interactive"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-school-primary-light/10 text-school-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {s.first_name?.[0]}{s.last_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-school-text truncate">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-school-muted sm:hidden truncate">{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-school-muted hidden sm:table-cell">{s.email || '---'}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {s.class_name ? (
                    <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded">
                      {s.class_name} - {s.class_section}
                    </span>
                  ) : (
                    <span className="text-gray-400">---</span>
                  )}
                </td>
                <td className="px-4 py-3 text-school-muted hidden lg:table-cell">{s.guardian_name || '---'}</td>
                <td className="px-4 py-3">{statusBadge(s.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-school-muted">
            {t('page')} {pagination.page} {t('of')} {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn-secondary btn-sm flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              {t('prev')}
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="btn-secondary btn-sm flex items-center gap-1"
            >
              {t('next')}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
