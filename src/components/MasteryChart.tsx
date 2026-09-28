'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function MasteryChart({ data }: { data: { topic: string; mastery: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-mist">Solve a few problems to start building your mastery map.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#A7A2C4', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="topic"
          width={110}
          tick={{ fill: '#EDEAF6', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(139,92,246,0.08)' }}
          contentStyle={{ background: '#171532', border: '1px solid #2c2755', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#EDEAF6' }}
        />
        <Bar dataKey="mastery" radius={[0, 6, 6, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.mastery >= 70 ? '#34D399' : d.mastery >= 40 ? '#F2B705' : '#8B5CF6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
