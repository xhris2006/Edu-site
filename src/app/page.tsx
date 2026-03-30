// src/app/page.tsx — Landing page
import Link from 'next/link'
import { Zap, TrendingUp, Hash, Lightbulb, Film, Instagram, Youtube, ArrowRight, CheckCircle, Star } from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: Film,
      title: 'TikTok Captions',
      titleFr: 'Captions TikTok',
      desc: 'Viral hooks & engaging captions',
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
    },
    {
      icon: Instagram,
      title: 'Instagram Posts',
      titleFr: 'Posts Instagram',
      desc: 'Aesthetic & story-driven content',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    {
      icon: Youtube,
      title: 'YouTube Scripts',
      titleFr: 'Scripts YouTube',
      desc: 'Full video scripts with structure',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },
    {
      icon: Hash,
      title: 'Hashtag Generator',
      titleFr: 'Générateur Hashtags',
      desc: '20-30 trending hashtags per post',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Lightbulb,
      title: 'Content Ideas',
      titleFr: 'Idées de Contenu',
      desc: '10 viral ideas per topic',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
    },
    {
      icon: TrendingUp,
      title: 'Trend Analyzer',
      titleFr: 'Analyseur Tendances',
      desc: "What's buzzing in Africa",
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
  ]

  const testimonials = [
    {
      name: 'Aminata K.',
      role: 'Content Creator, Douala',
      text: 'CreatorZap a multiplié mes vues par 3 sur TikTok. Incroyable!',
      stars: 5,
    },
    {
      name: 'Jean-Marc O.',
      role: 'YouTuber, Yaoundé',
      text: 'Les scripts générés sont parfaits pour mon audience camerounaise.',
      stars: 5,
    },
    {
      name: 'Fatou D.',
      role: 'Influenceuse, Abidjan',
      text: "L'outil idéal pour les créateurs africains. Merci CreatorZap!",
      stars: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-dark noise-bg relative">
      {/* Background glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-xl text-text-primary">
            Creator<span className="text-primary">Zap</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-text-secondary hover:text-text-primary text-sm transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-text-secondary hover:text-text-primary text-sm transition-colors">
            Pricing
          </Link>
          <Link href="/login" className="btn-secondary text-sm py-2 px-4">
            Se connecter
          </Link>
          <Link href="/register" className="btn-primary text-sm py-2 px-5">
            Commencer →
          </Link>
        </div>
        {/* Mobile nav */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/login" className="btn-ghost text-sm py-2 px-3">
            Connexion
          </Link>
          <Link href="/register" className="btn-primary text-sm py-2 px-4">
            Début →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-primary text-xs font-semibold tracking-wider uppercase">
            AI-Powered • Made for Africa
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-bold text-text-primary leading-tight mb-6">
          Crée du contenu
          <br />
          <span className="gradient-text">viral en secondes</span>
        </h1>

        <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          TikTok captions, Instagram posts, YouTube scripts, hashtags — générés par l&apos;IA pour les créateurs africains.
          <span className="text-text-primary"> En FR & EN.</span>
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/register" className="btn-primary text-base py-4 px-8 flex items-center gap-2 group">
            Commencer gratuitement
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="#features" className="btn-secondary text-base py-4 px-8">
            Voir les fonctionnalités
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { value: '10K+', label: 'Créateurs actifs' },
            { value: '500K+', label: 'Contenus générés' },
            { value: '3x', label: 'Plus de vues' },
            { value: 'FR/EN', label: 'Bilingue' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-text-muted text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-text-primary mb-4">
            Tout ce dont tu as besoin
          </h2>
          <p className="text-text-secondary text-lg">
            6 outils puissants pour dominer chaque plateforme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-hover group">
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="font-display font-semibold text-text-primary mb-1">{f.titleFr}</h3>
              <p className="text-text-secondary text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-text-primary mb-4">
            Tarifs simples
          </h2>
          <p className="text-text-secondary text-lg">
            Payez avec MTN MoMo ou Orange Money
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free */}
          <div className="card">
            <div className="badge-red mb-4">Gratuit</div>
            <div className="font-display text-4xl font-bold text-text-primary mb-1">0 XAF</div>
            <p className="text-text-secondary text-sm mb-6">Pour commencer</p>
            <ul className="space-y-3 mb-8">
              {['5 générations/jour', 'Tous les types de contenu', 'Historique limité'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-secondary w-full text-center block">
              Commencer gratuitement
            </Link>
          </div>

          {/* Premium */}
          <div className="card border-primary/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="badge-red mb-4">⚡ Premium</div>
            <div className="font-display text-4xl font-bold text-text-primary mb-1">
              2 500 XAF
              <span className="text-lg text-text-secondary font-normal">/mois</span>
            </div>
            <p className="text-text-secondary text-sm mb-6">Pour les créateurs sérieux</p>
            <ul className="space-y-3 mb-8">
              {[
                'Générations illimitées',
                'Tous les types de contenu',
                'Historique complet',
                'Sauvegarde des favoris',
                'Analyseur de tendances',
                'Support prioritaire',
                'FR + EN',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="btn-primary w-full text-center block">
              S&apos;abonner maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-text-primary mb-4">
            Ce que disent les créateurs
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                ))}
              </div>
              <p className="text-text-secondary text-sm mb-4 italic">&ldquo;{t.text}&rdquo;</p>
              <div>
                <div className="font-semibold text-text-primary text-sm">{t.name}</div>
                <div className="text-text-muted text-xs">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="card border-primary/30 py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-glow-red pointer-events-none" />
          <h2 className="font-display text-4xl font-bold text-text-primary mb-4 relative z-10">
            Prêt à devenir viral?
          </h2>
          <p className="text-text-secondary text-lg mb-8 relative z-10">
            Rejoins des milliers de créateurs africains sur CreatorZap
          </p>
          <Link href="/register" className="btn-primary text-base py-4 px-10 inline-flex items-center gap-2 relative z-10">
            <Zap className="w-5 h-5" />
            Commencer maintenant — Gratuit
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-card-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-text-primary">CreatorZap</span>
          </div>
          <p className="text-text-muted text-xs text-center">
            © 2024 CreatorZap. Développé par{' '}
            <a href="https://xhris84.netlify.app" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              Xhris Dior
            </a>{' '}
            — Yaoundé, Cameroun 🇨🇲
          </p>
          <div className="flex items-center gap-4 text-text-muted text-xs">
            <Link href="/login" className="hover:text-text-primary transition-colors">Connexion</Link>
            <Link href="/register" className="hover:text-text-primary transition-colors">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
