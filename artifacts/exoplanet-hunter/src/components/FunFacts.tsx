import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FACTS = [
  "Kepler discovered 2,662 confirmed exoplanets by staring at 150,000 stars for 9 years",
  "The transit method detects planets by measuring tiny dips in starlight — as small as 0.01%",
  "Kepler-452b orbits its sun-like star at nearly the same distance as Earth orbits the Sun",
  "Some exoplanets orbit so close to their star that a year lasts just a few hours",
  "TRAPPIST-1 hosts 7 Earth-sized planets — 3 in the habitable zone",
  "The nearest known exoplanet is Proxima Centauri b, just 4.2 light-years away",
  "Hot Jupiters are gas giants that orbit closer to their star than Mercury orbits our Sun",
  "NASA's James Webb Space Telescope can now directly image exoplanet atmospheres"
];

export function FunFacts() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FACTS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none select-none">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
          <path d="M2 12h20"/>
        </svg>
      </div>
      <CardHeader>
        <CardTitle className="font-mono text-sm tracking-widest text-secondary flex items-center gap-2">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
          MISSION LOG
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="min-h-[120px] flex items-center">
          <p 
            key={currentIndex} 
            className="text-lg text-foreground/90 font-serif leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-1000"
            data-testid="text-fun-fact"
          >
            "{FACTS[currentIndex]}"
          </p>
        </div>
        <div className="mt-6 flex gap-1.5">
          {FACTS.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i === currentIndex ? 'bg-secondary' : 'bg-secondary/20'}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}