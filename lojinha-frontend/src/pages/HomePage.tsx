import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import StatsBar from '../components/landing/StatsBar'
import Features from '../components/landing/Features'
import ProductHighlights from '../components/landing/ProductHighlights'
import CTABanner from '../components/landing/CTABanner'
import Footer from '../components/landing/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <Features />
        <ProductHighlights />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
