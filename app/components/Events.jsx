"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';


function Events() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetch('/api/events').then((r) => r.json()).then((d) => setEvents(Array.isArray(d?.data) ? d.data : [])).catch(() => {});
  }, []);
  return (
    <section id="events" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 glass rounded-full text-xs text-[#00D4FF]">
            <Calendar className="w-3 h-3" /> Community
          </div>
          <h2 className="text-4xl lg:text-6xl font-bold mb-4">
            Upcoming <span className="text-gradient-blue">events & hackathons</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto text-lg">Join the AiGlo community of builders. Conferences, hackathons and deep tech meetups.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {events.map((e, i) => (
            <motion.div key={e.id || e._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl overflow-hidden card-hover">
              <div className="aspect-video relative overflow-hidden">
                <Image src={e.image} alt={e.title} fill className=" object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#03050B] via-transparent to-transparent" />
                <span className="absolute top-4 right-4 text-xs px-3 py-1 rounded-full glass-strong text-[#00D4FF]">{e.eventType}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{e.title}</h3>
                <p className="text-white/60 text-sm mb-4 line-clamp-2">{e.description}</p>
                <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {e.date ? new Date(e.date).toLocaleDateString():"TBA"}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {e.location}</span>
                </div>
                <button className="w-full btn-ghost py-2.5 rounded-lg text-sm">Register</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Events;