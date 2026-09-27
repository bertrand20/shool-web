import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CalendarDays, ChevronRight, Compass, Cross, HeartHandshake, Landmark, Mail, MapPin, Megaphone, Phone, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useI18n } from '../i18n/context'

const API = '/api/public'
const links = { about: '/about', academics: '/academics', admissions: '/admissions', studentLife: '/student-life', news: '/news', events: '/events', gallery: '/gallery', achievements: '/achievements', contact: '/contact' }

async function getPublic(path) {
  const response = await fetch(`${API}${path}`)
  if (!response.ok) throw new Error('request failed')
  return response.json()
}

function Heading({ eyebrow, title, description, to, action }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-9"><div className="max-w-2xl"><p className="public-eyebrow mb-3">{eyebrow}</p><h2 className="text-2xl sm:text-3xl text-school-primary font-bold leading-tight">{title}</h2>{description && <p className="mt-3 text-school-muted leading-relaxed">{description}</p>}</div>{action && <Link to={to} className="inline-flex items-center gap-2 text-sm font-bold text-school-burgundy">{action}<ArrowRight size={16}/></Link>}</div>
}

function State({ error, empty }) {
  if (error) return <p className="border-l-2 border-school-accent pl-4 py-2 text-sm text-school-muted">{error}</p>
  return <div className="border border-dashed border-school-border bg-white/60 px-6 py-8 text-sm text-school-muted">{empty}</div>
}

function Card({ icon: Icon, title, text, to, action }) {
  return <div className="border border-school-border bg-white p-6 min-h-48 flex flex-col"><Icon size={22} className="text-school-accent mb-5" strokeWidth={1.6}/><h3 className="text-lg font-bold text-school-primary">{title}</h3><p className="text-sm text-school-muted mt-2 leading-relaxed flex-1">{text}</p><Link to={to} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-school-burgundy">{action}<ChevronRight size={15}/></Link></div>
}

function dateLabel(value) { return value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '' }

export default function ParentDashboard() {
  const { t } = useI18n()
  const [data, setData] = useState({ info: {}, news: [], events: [], academics: [], studentLife: [], achievements: [], gallery: [] })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let active = true
    const requests = { info: '/school-info', news: '/news', events: '/events', academics: '/academics', studentLife: '/student-life', achievements: '/achievements', gallery: '/gallery' }
    Promise.all(Object.entries(requests).map(async ([key, path]) => {
      try { return [key, await getPublic(path)] } catch { return [key, null] }
    })).then((results) => {
      if (!active) return
      const next = { ...data }
      const failed = {}
      results.forEach(([key, value]) => { if (value === null) failed[key] = t('homepage.unavailable'); else next[key] = value?.items || value })
      setData(next)
      setErrors(failed)
    })
    return () => { active = false }
  }, [t])

  const info = data.info || {}
  const news = Array.isArray(data.news) ? data.news.slice(0, 3) : []
  const gallery = Array.isArray(data.gallery) ? data.gallery.slice(0, 6) : []
  const events = (Array.isArray(data.events) ? data.events : []).filter((event) => !event.event_date || new Date(event.event_date) >= new Date()).slice(0, 3)

  return <div className="bg-school-surface text-school-text">
    <section className="relative overflow-hidden bg-school-primary text-white"><div className="absolute inset-0 opacity-20" aria-hidden="true" style={{ backgroundImage: 'linear-gradient(135deg, transparent 0 55%, rgba(178,138,59,.4) 55% 56%, transparent 56%)' }}/><div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28 grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center"><div><p className="text-school-accent-light text-xs font-bold uppercase tracking-[0.2em] mb-5">Ndera, Rwanda</p><h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] max-w-3xl">{info.hero_title || t('homepage.heroTitle')}</h1><p className="mt-6 text-lg text-white/75 leading-relaxed max-w-2xl">{info.hero_intro || t('homepage.heroIntro')}</p><div className="mt-9 flex flex-wrap gap-3"><Link to={links.admissions} className="inline-flex items-center gap-2 bg-school-burgundy px-5 py-3 font-bold text-sm">{t('homepage.admissions')}<ArrowRight size={16}/></Link><Link to={links.about} className="inline-flex items-center gap-2 border border-white/35 px-5 py-3 font-bold text-sm">{t('homepage.discover')}<ArrowRight size={16}/></Link></div></div><div className="min-h-[17rem] sm:min-h-[22rem] border border-white/20 bg-white/5 flex items-center justify-center p-8" aria-label={t('homepage.imagePlaceholder')}><div className="text-center max-w-xs"><Landmark size={48} className="mx-auto text-school-accent-light" strokeWidth={1.2}/><p className="mt-5 font-bold">{t('homepage.imagePlaceholder')}</p><p className="mt-2 text-sm text-white/55">{t('homepage.imagePlaceholderHint')}</p></div></div></div></section>

    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"><div className="grid lg:grid-cols-[1.15fr_.85fr] gap-12 items-start"><div><p className="public-eyebrow mb-3">{t('homepage.aboutEyebrow')}</p><h2 className="text-3xl sm:text-4xl font-bold text-school-primary leading-tight">{t('homepage.aboutTitle')}</h2><p className="mt-5 text-school-muted text-lg leading-relaxed">{info.about || t('homepage.aboutPlaceholder')}</p><Link to={links.about} className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-school-burgundy">{t('homepage.learnMore')}<ArrowRight size={16}/></Link></div><div className="grid sm:grid-cols-2 gap-4">{[[Cross, 'valueFaith'], [BookOpen, 'valueKnowledge'], [ShieldCheck, 'valueDiscipline'], [HeartHandshake, 'valueService']].map(([Icon, key]) => <div key={key} className="bg-white border border-school-border p-5"><Icon size={21} className="text-school-accent mb-4"/><h3 className="font-bold text-school-primary">{t(`homepage.${key}`)}</h3><p className="mt-2 text-xs leading-relaxed text-school-muted">{t('homepage.valuePlaceholder')}</p></div>)}</div></div></section>

    <section className="bg-white border-y border-school-border"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"><Heading eyebrow={t('homepage.academicsEyebrow')} title={t('homepage.academicsTitle')} description={t('homepage.academicsDescription')} action={t('homepage.explore')} to={links.academics}/>{errors.academics ? <State error={errors.academics}/> : data.academics.length === 0 ? <State empty={t('homepage.academicsEmpty')}/> : <div className="grid md:grid-cols-3 gap-5">{data.academics.slice(0, 3).map((item) => <Card key={item.id || item.name} icon={BookOpen} title={item.name || item.title} text={item.description || ''} to={links.academics} action={t('homepage.learnMore')}/>)}</div>}</div></section>

    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"><Heading eyebrow={t('homepage.formationEyebrow')} title={t('homepage.formationTitle')} description={t('homepage.formationDescription')} action={t('homepage.explore')} to={links.studentLife}/>{errors.studentLife ? <State error={errors.studentLife}/> : data.studentLife.length === 0 ? <State empty={t('homepage.studentLifeEmpty')}/> : <div className="grid md:grid-cols-3 gap-5">{data.studentLife.slice(0, 3).map((item) => <Card key={item.id || item.name} icon={Users} title={item.name || item.title} text={item.description || ''} to={links.studentLife} action={t('homepage.learnMore')}/>)}</div>}</section>

    <section className="bg-school-primary text-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid lg:grid-cols-[1fr_auto] gap-8 items-center"><div><p className="public-eyebrow text-school-accent-light mb-3">{t('homepage.admissionsEyebrow')}</p><h2 className="text-2xl sm:text-3xl font-bold">{t('homepage.admissionsTitle')}</h2><p className="mt-3 text-white/70 max-w-2xl leading-relaxed">{t('homepage.admissionsDescription')}</p></div><Link to={links.admissions} className="inline-flex items-center justify-center gap-2 bg-school-accent text-school-primary px-5 py-3 font-bold text-sm">{t('homepage.admissionsAction')}<ArrowRight size={16}/></Link></div></section>

    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"><div className="grid lg:grid-cols-2 gap-14"><div><Heading eyebrow={t('homepage.newsEyebrow')} title={t('homepage.newsTitle')} action={t('homepage.viewAll')} to={links.news}/>{errors.news ? <State error={errors.news}/> : news.length === 0 ? <State empty={t('homepage.newsEmpty')}/> : <div className="space-y-4">{news.map((item) => <article key={item.id} className="border-b border-school-border pb-4"><p className="text-xs text-school-accent font-bold uppercase tracking-wide">{dateLabel(item.created_at)}</p><h3 className="mt-2 text-lg font-bold text-school-primary">{item.title}</h3><p className="mt-1 text-sm text-school-muted line-clamp-2">{item.content}</p></article>)}</div>}</div><div><Heading eyebrow={t('homepage.eventsEyebrow')} title={t('homepage.eventsTitle')} action={t('homepage.viewAll')} to={links.events}/>{errors.events ? <State error={errors.events}/> : events.length === 0 ? <State empty={t('homepage.eventsEmpty')}/> : <div className="space-y-4">{events.map((item) => <article key={item.id} className="flex gap-4 border-b border-school-border pb-4"><div className="w-12 h-12 shrink-0 bg-school-surface border border-school-border flex flex-col items-center justify-center text-school-primary"><CalendarDays size={15}/><span className="text-[0.6rem] font-bold mt-1">{item.event_date ? new Date(item.event_date).getDate() : ''}</span></div><div><h3 className="font-bold text-school-primary">{item.title}</h3><p className="text-sm text-school-muted mt-1">{dateLabel(item.event_date)}{item.location ? ` · ${item.location}` : ''}</p></div></article>)}</div>}</div></div></section>

    <section className="bg-white border-y border-school-border"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"><Heading eyebrow={t('homepage.galleryEyebrow')} title={t('homepage.galleryTitle')} action={t('homepage.viewAll')} to={links.gallery}/>{errors.gallery ? <State error={errors.gallery}/> : gallery.length === 0 ? <State empty={t('homepage.galleryEmpty')}/> : <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{gallery.map((item) => <Link to={links.gallery} key={item.id} className="group aspect-[4/3] overflow-hidden bg-school-surface border border-school-border"><img loading="lazy" src={item.image_url} alt={item.title || t('homepage.galleryImageAlt')} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"/></Link>)}</div>}</div></section>

    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"><div className="grid md:grid-cols-3 gap-5"><Card icon={Sparkles} title={t('homepage.achievementsTitle')} text={data.achievements.length ? t('homepage.publishedContent') : t('homepage.achievementsEmpty')} to={links.achievements} action={t('homepage.viewSection')}/><Card icon={Compass} title={t('homepage.admissionsTitle')} text={t('homepage.admissionsEmpty')} to={links.admissions} action={t('homepage.viewSection')}/><Card icon={Megaphone} title={t('homepage.publicationsTitle')} text={t('homepage.publicationsEmpty')} to={links.news} action={t('homepage.viewSection')}/></div></section>

    <section className="bg-[#eeeae0] border-t border-school-border"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16"><Heading eyebrow={t('homepage.contactEyebrow')} title={t('homepage.contactTitle')} description={t('homepage.contactDescription')} action={t('homepage.contactAction')} to={links.contact}/><div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{info.contact_address && <div className="flex gap-3"><MapPin size={19} className="text-school-accent shrink-0"/><span className="text-sm text-school-muted">{info.contact_address}</span></div>}{info.contact_phone && <div className="flex gap-3"><Phone size={19} className="text-school-accent shrink-0"/><span className="text-sm text-school-muted">{info.contact_phone}</span></div>}{info.contact_email && <div className="flex gap-3"><Mail size={19} className="text-school-accent shrink-0"/><span className="text-sm text-school-muted break-all">{info.contact_email}</span></div>}{info.contact_hours && <div className="flex gap-3"><CalendarDays size={19} className="text-school-accent shrink-0"/><span className="text-sm text-school-muted">{info.contact_hours}</span></div>}</div></div></section>
  </div>
}
