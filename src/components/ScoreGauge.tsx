import { cn } from '../lib/utils';

interface ScoreGaugeProps {
  score: number | null;
  status: string;
}

export function ScoreGauge({ score, status }: ScoreGaugeProps) {
  const isPending = score === null || status !== 'completed';
  const displayScore = isPending ? 0 : score;

  const getColor = (s: number) => {
    if (s >= 90) return '#10B981'; // Emerald
    if (s >= 70) return '#F59E0B'; // Amber
    return '#EF4444'; // Rose
  };

  const color = getColor(displayScore);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="w-32 h-32 relative flex items-center justify-center">
        <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="rgba(31, 41, 55, 0.5)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={isPending ? 'transparent' : color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-3xl font-bold text-white tracking-tighter">
            {isPending ? '...' : displayScore}
          </span>
        </div>
        {isPending && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-full h-full border-[3px] border-transparent border-t-brand-cyan rounded-full animate-spin opacity-50"></div>
          </div>
        )}
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-lg font-bold text-gray-200">Cyber Health</h3>
        <p className="text-sm text-gray-500">
          {isPending ? 'Computing...' : (displayScore >= 90 ? 'Excellent' : displayScore >= 70 ? 'Needs Attention' : 'Critical Risk')}
        </p>
      </div>
    </div>
  );
}
