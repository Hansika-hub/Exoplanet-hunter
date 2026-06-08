import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

interface LightCurveChartProps {
  flux: number[];
}

export function LightCurveChart({ flux }: LightCurveChartProps) {
  const data = useMemo(() => {
    // Downsample ~3197 points to ~400 for performance
    const step = Math.ceil(flux.length / 400);
    const sampled = [];
    for (let i = 0; i < flux.length; i += step) {
      sampled.push({
        time: i,
        flux: flux[i],
      });
    }
    return sampled;
  }, [flux]);

  if (!flux || flux.length === 0) return null;

  return (
    <div className="w-full h-[300px]" data-testid="light-curve-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}`}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              fontFamily: 'monospace'
            }}
            itemStyle={{ color: 'hsl(var(--primary))' }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
            formatter={(value: number) => [value.toFixed(4), 'Flux']}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="flux" 
            stroke="hsl(var(--primary))" 
            strokeWidth={1.5} 
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}