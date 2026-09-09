import React, { useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Cpu, Send, User, Bot, Loader2 } from 'lucide-react';

const AskFacilityAI = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello. I am the Facility Intelligence Engine. I have real-time access to the Energy, Maintenance, Occupancy, Security, and Cost agents. How can I assist you with your facility operations today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Mock NLP response logic reflecting the prompt's requirements
    setTimeout(() => {
      const q = userMsg.content.toLowerCase();
      let aiMsg = { role: 'assistant', content: 'I can help you analyze facility costs, budgets, energy, maintenance, occupancy, and security.' };
      
      if (q.includes('increase') || q.includes('why did operating costs')) {
        aiMsg.content = "Operating costs increased by 12% primarily because HVAC energy consumption rose by 18% and emergency maintenance costs increased by 24%. The highest increase occurred on Floor 4.";
      } else if (q.includes('save money') || q.includes('opportunity')) {
        aiMsg.content = "The largest opportunity is HVAC optimization, estimated at ₹85,000/month, followed by preventive maintenance at ₹40,000/month and workspace consolidation at ₹30,000/month.";
      } else if (q.includes('security') || q.includes('staffing')) {
        aiMsg.content = "Security incidents are increasing in Zone C. Before expanding staffing, I recommend investigating access-control failures on the primary entrance doors.";
      }

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="dashboard-page flex flex-col h-[calc(100vh-120px)] space-y-4">
      
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <Cpu className="w-6 h-6 text-cyan-400" />
        <h1 className="text-2xl font-bold text-slate-100">Ask Facility AI</h1>
      </div>

      <GlassCard className="flex-1 flex flex-col overflow-hidden p-0 border-slate-700/60">
        
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/40">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-cyan-900/60 border border-cyan-500/50'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-cyan-400" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/50 shadow-lg'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-cyan-900/60 border border-cyan-500/50 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="bg-slate-800/80 text-slate-400 px-4 py-3 rounded-2xl rounded-tl-none text-sm flex items-center gap-2 border border-slate-700/50">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                Querying multi-agent datastores...
              </div>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about costs, anomalies, budgets, or energy..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-full pl-5 pr-12 py-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 disabled:hover:bg-cyan-600 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

      </GlassCard>

    </div>
  );
};

export default AskFacilityAI;
