import { useState } from 'react';
import { Shield, Zap, Lock, Github, ArrowRight, ShieldCheck, Code, Eye, Play, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScanEngine } from '../lib/scanEngine';

export default function Hero() {
  const navigate = useNavigate();
  const { startScan, pollScan } = useScanEngine();
  const [isStartingDemo, setIsStartingDemo] = useState(false);

  const handleLiveDemo = async () => {
    try {
      setIsStartingDemo(true);
      const scanId = await startScan('expressjs/express', 'master');
      pollScan(scanId);
      navigate(`/scans/${scanId}`);
    } catch (e) {
      console.error('Failed to launch live demo', e);
      navigate('/scans/new');
    } finally {
      setIsStartingDemo(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background grids and glows */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 z-0 mix-blend-overlay"></div>
      <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-emerald/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-brand-cyan/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-sm font-medium mb-8">
            <ShieldCheck className="w-4 h-4" />
            <span>OWASP Top 10 Coverage</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Secure your code at the speed of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-brand-cyan">thought.</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            GitArmor AI combines deep AST parsing with Gemini 2.5 Flash to detect logic flaws, secrets, and injection vectors, then generates surgical PRs to fix them.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/scans/new')}
              className="group flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-all glow-cyan"
            >
              <Github className="w-5 h-5" />
              Sign in with GitHub
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={handleLiveDemo}
              disabled={isStartingDemo}
              className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-gray-900 text-white border border-gray-800 rounded-xl font-semibold hover:bg-gray-800 hover:border-brand-cyan/40 transition-all cursor-pointer disabled:opacity-70"
            >
              {isStartingDemo ? (
                <>
                  <Loader2 className="w-5 h-5 text-brand-cyan animate-spin" />
                  <span>Launching Demo Scan...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 text-brand-cyan fill-brand-cyan/20" />
                  <span>View Live Demo</span>
                </>
              )}
            </button>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            Requires <code className="text-gray-400 font-mono text-xs">repo</code> and <code className="text-gray-400 font-mono text-xs">workflow</code> scopes.
          </p>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: <Eye className="w-6 h-6 text-brand-cyan" />,
              title: "Deep Semantic Scanning",
              description: "Goes beyond regex. Understands cross-file data flow to detect complex injection and logic bugs."
            },
            {
              icon: <Zap className="w-6 h-6 text-brand-amber" />,
              title: "Instant Remediation",
              description: "Doesn't just flag issues. Generates surgical, minimal diffs and opens Pull Requests automatically."
            },
            {
              icon: <Lock className="w-6 h-6 text-brand-emerald" />,
              title: "Ephemeral Isolation",
              description: "Your code never rests on our disks. Evaluated in secure, ephemeral microVMs that vanish post-scan."
            }
          ].map((feature, i) => (
            <div key={i} className="glass-panel p-8 text-left">
              <div className="h-12 w-12 rounded-lg bg-gray-800/50 flex items-center justify-center mb-6 border border-gray-700/50">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
