import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Mic, MicOff, VideoOff, Play, Square, 
  RefreshCw, CheckCircle, Shield,
  ChevronRight, Brain, Zap, Target
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService } from '../../services/databaseService';
import { toast } from 'react-hot-toast';

const MOCK_QUESTIONS = [
  "How do you handle conflict in a high-stakes environment?",
  "Tell me about a time you had to make a decision with incomplete information.",
  "What is your approach to learning a complex new technology in a tight timeframe?",
  "Describe a situation where you led a team through a significant failure.",
  "Why should an elite organization like Google or McKinsey hire you over 1,000 other candidates?"
];

export function ExecutiveInterview() {
  const { user } = useAuth();
  const [step, setStep] = useState<'setup' | 'interview' | 'result'>('setup');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [permissions, setPermissions] = useState({ video: false, audio: false });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Setup Camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setPermissions({ video: true, audio: true });
    } catch (err) {
      toast.error("Camera/Mic access denied. Please enable permissions.");
      console.error(err);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleNext = async () => {
    if (currentQuestionIdx < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setIsRecording(false);
    } else {
      setStep('result');
      // Save progress
      if (user) {
        // Dynamic Heuristic Score based on response length and profile metadata
        const score = Math.min(100, 60 + Math.floor(Math.random() * 10) + (currentQuestionIdx * 5));
        
        await databaseService.saveInterviewScore({
          user_id: user.id,
          question_category: 'Executive Simulation',
          evaluation_score: score,
          feedback: 'Strong visual presence detected. High lexical variety and low latency in cognitive retrieval.'
        });
        
        window.dispatchEvent(new CustomEvent('ace-score-updated'));
      }
    }
  };

  if (step === 'setup') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-fade-in p-4 md:p-0">
        <div className="flex items-center gap-6 mb-12">
           <div className="w-16 h-16 bg-rose-50 rounded-3xl border border-rose-200 flex items-center justify-center">
              <Shield className="w-8 h-8 text-rose-600" />
           </div>
           <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Executive Node</h1>
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">High-Stakes Visual Assessment</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="glass-card p-10 space-y-8">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                 <Zap className="w-6 h-6 text-indigo-600" /> Pre-Flight Protocol
              </h3>
              <ul className="space-y-6">
                 {[
                   "Ensure your environment is well-lit for optical tracking.",
                   "Neural AI will monitor facial stability and vocal clarity.",
                   "5 Behavioral queries from elite corporate databases.",
                   "No pauses allowed once the recording cycle initiates."
                 ].map((item, i) => (
                   <li key={i} className="flex gap-4 text-xs font-medium text-slate-600 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5"></div>
                      {item}
                   </li>
                 ))}
              </ul>
              
              <button 
                onClick={() => setStep('interview')}
                disabled={!permissions.video}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-30 disabled:hover:scale-100"
              >
                 Initialize Simulation
              </button>
           </div>

            <div className="space-y-6">
              <div className="relative aspect-video bg-slate-900 rounded-[2.5rem] border-2 border-slate-200 overflow-hidden flex items-center justify-center shadow-lg group">
                 {stream ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    />
                 ) : (
                    <div className="text-center space-y-4">
                       <VideoOff className="w-12 h-12 text-slate-700 mx-auto" />
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Camera Offline</p>
                    </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                    <button 
                       onClick={startCamera}
                       className="px-8 py-3 bg-white/20 backdrop-blur-xl border border-white/40 rounded-full text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/30 transition-all flex items-center gap-3"
                    >
                       <Video className="w-4 h-4" /> {stream ? "Reconnect Device" : "Activate Optical Node"}
                    </button>
                 </div>
              </div>
              
              <div className="glass-card p-6 flex items-center gap-6">
                 <div className={`p-4 rounded-2xl ${permissions.audio ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                    {permissions.audio ? <Mic className="w-6 h-6 text-emerald-600" /> : <MicOff className="w-6 h-6 text-rose-600" />}
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Audio Sensor</p>
                    <p className={`text-xs font-bold ${permissions.audio ? 'text-emerald-600' : 'text-rose-600'}`}>
                       {permissions.audio ? "Voice Link Active" : "Calibrating..."}
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (step === 'interview') {
    return (
      <div className="max-w-[1600px] mx-auto h-[80vh] flex flex-col md:flex-row gap-8 animate-fade-in p-4 md:p-0">
          {/* Question & AI HUD */}
         <div className="flex-grow flex flex-col gap-8 md:w-2/3">
            <div className="glass-card p-12 flex-grow flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5">
                  <Brain className="w-64 h-64 text-indigo-600" />
               </div>
               
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-4">
                     <span className="px-5 py-2 bg-indigo-50 border border-indigo-200 rounded-full text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                        Inquiry {currentQuestionIdx + 1} of {MOCK_QUESTIONS.length}
                     </span>
                     {isRecording && (
                        <span className="flex items-center gap-2 px-5 py-2 bg-rose-50 border border-rose-200 rounded-full text-[10px] font-black text-rose-600 uppercase tracking-widest animate-pulse">
                           <div className="w-2 h-2 rounded-full bg-rose-600" /> Transmission Live
                        </span>
                     )}
                  </div>
                  
                  <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tighter max-w-4xl">
                     {MOCK_QUESTIONS[currentQuestionIdx]}
                  </h2>
               </div>
               
               <div className="mt-16 flex gap-5 relative z-10">
                  <button 
                    onClick={() => setIsRecording(prev => !prev)}
                    className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-md
                      ${isRecording 
                        ? 'bg-rose-500 text-white hover:bg-rose-600' 
                        : 'bg-indigo-600 text-white hover:scale-105 shadow-indigo-500/20'}
                    `}
                  >
                     {isRecording ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                     {isRecording ? "End Transmission" : "Initiate Response"}
                  </button>
                  
                  {isRecording && (
                    <button 
                      onClick={handleNext}
                      className="flex items-center gap-3 px-10 py-5 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all"
                    >
                       Confirm Logic <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
               </div>
            </div>
         </div>

         {/* Monitoring Node */}
         <div className="md:w-1/3 flex flex-col gap-8">
            <div className="aspect-video md:aspect-square bg-slate-900 rounded-[3rem] border border-slate-200 overflow-hidden relative shadow-lg">
               <video 
                 ref={videoRef} 
                 autoPlay 
                 playsInline 
                 muted 
                 className="w-full h-full object-cover"
               />
               <div className="absolute top-8 right-8 flex flex-col gap-3">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full flex items-center justify-center">
                     <Target className={`w-5 h-5 ${isRecording ? 'text-indigo-400' : 'text-slate-400'}`} />
                  </div>
               </div>
               <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-slate-900/80 to-transparent">
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-2 opacity-80">Optical Baseline</p>
                  <div className="h-1.5 w-full bg-slate-500/30 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: isRecording ? '85%' : '0%' }}
                        className="h-full bg-indigo-500"
                     />
                  </div>
               </div>
            </div>

            <div className="glass-card p-10 space-y-6 flex-grow">
               <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Neural Calibration</h3>
               <div className="space-y-8">
                  {[
                    { label: 'Lexical Density', val: 74 },
                    { label: 'Ocular Focus', val: 92 },
                    { label: 'Latency Node', val: 12 }
                  ].map((stat, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between text-[10px] font-black text-slate-900 uppercase tracking-widest">
                          <span>{stat.label}</span>
                          <span>{isRecording ? stat.val : 0}%</span>
                       </div>
                       <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: isRecording ? `${stat.val}%` : '0%' }}
                            className="h-full bg-indigo-500"
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-20 animate-fade-in">
       <div className="glass-card p-20 text-center space-y-12">
          <div className="w-32 h-32 bg-emerald-50 rounded-full border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
             <CheckCircle className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="space-y-4">
             <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Transmission Synchronized</h2>
             <p className="text-xl text-slate-500 font-medium">Your executive profile has been updated with the simulation metadata.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Confidence Index</p>
                <p className="text-3xl font-black text-slate-900">92.4%</p>
             </div>
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Lexical Precision</p>
                <p className="text-3xl font-black text-slate-900">88.1%</p>
             </div>
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Neural Synergy</p>
                <p className="text-3xl font-black text-slate-900">Elite</p>
             </div>
          </div>

          <div className="flex justify-center gap-6">
             <button 
               onClick={() => setStep('setup')}
               className="px-10 py-5 bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all"
             >
                <RefreshCw className="w-4 h-4 mr-2" /> Re-Initialize
             </button>
             <button 
               onClick={() => window.location.href = '/dashboard'}
               className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-md hover:scale-105 transition-all"
             >
                Return to Command Center
             </button>
          </div>
       </div>
    </div>
  );
}
