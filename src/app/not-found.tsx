import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Compass className="text-arcane-400 mb-4" size={40} />
      <h1 className="font-display text-2xl text-parchment mb-2">You've wandered off the map</h1>
      <p className="text-mist mb-6">This realm doesn't exist yet.</p>
      <Link
        href="/dashboard"
        className="bg-arcane-500 hover:bg-arcane-400 text-obsidian-950 font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        Back to safety
      </Link>
    </div>
  );
}
