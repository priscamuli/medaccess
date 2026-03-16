import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, AlertTriangle, Users, ArrowRight, Shield, Activity, Baby } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function Landing() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container py-20 md:py-32">
          <motion.div className="mx-auto max-w-3xl text-center" initial="hidden" animate="visible">
            <motion.div variants={fadeUp} custom={0} className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Heart className="h-4 w-4" /> Healthcare Access & Visibility
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mb-6 font-display text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              No mother left behind due to{" "}
              <span className="text-gradient-primary">medicine shortages</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mb-8 text-lg text-muted-foreground md:text-xl">
              MedAccess bridges the gap between rural communities and essential healthcare by providing real-time medicine availability, clinic mapping, and maternal risk tracking.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 px-8">
                <Link to="/register">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#problem">Learn More</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        {/* Decorative blob */}
        <div className="pointer-events-none absolute -top-40 right-0 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
      </section>

      {/* Problem */}
      <section id="problem" className="container py-20">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="mb-3 font-display text-3xl font-bold">The Problem</h2>
          <p className="text-muted-foreground">Millions in rural areas lack access to essential medicines, putting vulnerable populations—especially mothers—at critical risk.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: MapPin, title: "Invisible Clinics", desc: "Patients don't know which clinics near them have the medicines they need." },
            { icon: AlertTriangle, title: "Medicine Shortages", desc: "Critical maternal medicines run out without early warning systems." },
            { icon: Baby, title: "Maternal Risk", desc: "Lack of oxytocin and misoprostol leads to preventable maternal deaths." },
          ].map((item, i) => (
            <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className="h-full border-none shadow-card hover:shadow-lg transition-shadow">
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
                    <item.icon className="h-7 w-7 text-destructive" />
                  </div>
                  <h3 className="mb-2 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="bg-muted/50 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="mb-3 font-display text-3xl font-bold">Our Solution</h2>
            <p className="text-muted-foreground">MedAccess provides real-time visibility into medicine availability across rural health networks.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MapPin, title: "Live Clinic Map", desc: "Interactive map with color-coded availability markers" },
              { icon: Shield, title: "Stock Alerts", desc: "Real-time notifications when critical medicines run low" },
              { icon: Activity, title: "Maternal Tracking", desc: "Priority tracking for maternal medicine shortages" },
              { icon: Users, title: "Request System", desc: "Patients can request medicines and book appointments" },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card className="h-full border-none shadow-card">
                  <CardContent className="p-6">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mb-1 font-display font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="mb-3 font-display text-3xl font-bold">Projected Impact</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { value: "40%", label: "Reduction in medicine search time" },
            { value: "3x", label: "Faster response to maternal emergencies" },
            { value: "100+", label: "Rural clinics connected" },
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center">
              <div className="mb-2 font-display text-5xl font-extrabold text-gradient-primary">{stat.value}</div>
              <p className="text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-primary py-16">
        <div className="container text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground">Ready to make healthcare accessible?</h2>
          <p className="mb-8 text-primary-foreground/80">Join MedAccess today and help bridge the rural health gap.</p>
          <Button asChild size="lg" variant="secondary" className="px-8">
            <Link to="/login">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
          <div className="flex items-center gap-1 font-display font-semibold text-foreground">
            <Heart className="h-4 w-4 text-primary" fill="currentColor" /> MedAccess
          </div>
          <p>Built for bridging gaps, saving lives.</p>
        </div>
      </footer>
    </div>
  );
}
