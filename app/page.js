import dynamic from "next/dynamic";

import Nav from "@/app/components/Nav";
import Hero from "@/app/components/Hero";
import LogoMarquee from "@/app/components/LogoMarquee";
import Stats from "@/app/components/Stats";
import Services from "@/app/components/Services";

const AutomationShowcase = dynamic(
  () => import("@/app/components/AutomationShowcase")
);

const Portfolio = dynamic(
  () => import("@/app/components/Portfolio")
);

const Testimonials = dynamic(
  () => import("@/app/components/Testimonials")
);

const BlogPreview = dynamic(
  () => import("@/app/components/BlogPreview")
);

const Events = dynamic(
  () => import("@/app/components/Events")
);

const Contact = dynamic(
  () => import("@/app/components/Contact")
);

const FinalCTA = dynamic(
  () => import("@/app/components/FinalCTA")
);

const Footer = dynamic(
  () => import("@/app/components/Footer")
);

export default function HomePage() {
  return (
    <main className="relative">
      {/* Above the fold */}
      <Nav />
      <Hero />
      <LogoMarquee />
      <Stats />
      <Services />

      {/* Below the fold */}
      <AutomationShowcase />
      <Portfolio />
      <Testimonials />
      <BlogPreview />
      <Events />
      <Contact />
      <FinalCTA />
      <Footer />
    </main>
  );
}