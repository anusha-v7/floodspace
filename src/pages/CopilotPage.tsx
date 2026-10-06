import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  CheckCircle2,
  Database,
  Globe2,
  Languages,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { DemoBadge } from '../components/DemoBadge';
import { StatusBadge } from '../components/StatusBadge';
import { VERIFIED_SYSTEM_FACTS } from '../data/mockData';
import {
  askSituationCopilot,
  getInitialCopilotMessages,
} from '../services/aiService';
import { CopilotMessage } from '../types';

export const CopilotPage: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'ne'>('en');
  const [messages, setMessages] = useState<CopilotMessage[]>(() =>
    getInitialCopilotMessages('en')
  );
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // When language changes, update initial greetings if only 1 message exists
    if (messages.length <= 1) {
      setMessages(getInitialCopilotMessages(language));
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg: CopilotMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const response = await askSituationCopilot({
        query: q,
        language,
      });

      const assistantMsg: CopilotMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: 'Just now',
        text: response.data.answer,
        groundedFactsUsed: response.data.groundedFacts,
        suggestedQuestions: response.data.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Copilot query error', err);
    } finally {
      setIsTyping(false);
    }
  };

  const sampleQuestions =
    language === 'ne'
      ? [
          'कुन बस्तीहरू हाल सडकविहीन छन्?',
          'कुन पुलको प्राथमिकता सबैभन्दा उच्च छ?',
          'सबैभन्दा बढी प्रभावित क्षेत्र कुन हो?',
          'उद्धार स्थिति प्रतिवेदन तयार पार्नुहोस्',
          'अस्पतालहरूको अवस्था कस्तो छ?',
        ]
      : [
          'Which settlements are currently cut off?',
          'Which bridge has the highest priority?',
          'Summarize the most affected zones.',
          'Prepare a rescue situation report.',
          'Are referral hospitals accessible?',
        ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              SITUATION-REPORT COPILOT
            </h1>
            <DemoBadge label="GROUNDED SYSTEM ASSISTANT" variant="cyan" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Grounded briefing assistant translating satellite change polygons and road connectivity graphs into actionable rescue dispatches.
          </p>
        </div>

        {/* English / Nepali Language Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded border border-slate-800 text-xs font-mono">
            <Languages className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded transition-colors ${
                language === 'en' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ne')}
              className={`px-2.5 py-1 rounded transition-colors ${
                language === 'ne' ? 'bg-cyan-500 text-black font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              नेपाली (Nepali)
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Grounding Invariant Banner */}
      <div className="p-3 bg-cyan-950/20 border border-cyan-500/40 rounded-lg flex items-center justify-between gap-3 text-xs text-cyan-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold uppercase tracking-wide">
            AI RESPONSES MUST BE GROUNDED IN VERIFIED SYSTEM DATA
          </span>
        </div>
        <span className="text-[11px] font-mono text-cyan-400 hidden sm:inline">
          Invariants: Hallucination Prevention Active
        </span>
      </div>

      {/* Split Interface: Left Conversation Area (7 Cols), Right System Facts (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Conversation Area */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-lg flex flex-col h-[600px] overflow-hidden">
          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-lg p-3 space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500 text-black font-medium'
                      : 'bg-slate-950 border border-slate-800 text-slate-200'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Grounded facts badge pills for assistant */}
                  {msg.groundedFactsUsed && msg.groundedFactsUsed.length > 0 && (
                    <div className="pt-2 border-t border-slate-850 flex flex-wrap gap-1.5 text-[10px] font-mono text-cyan-400">
                      <span className="text-slate-500">Facts applied:</span>
                      {msg.groundedFactsUsed.map((fact, idx) => (
                        <span key={idx} className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          ✓ {fact}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 text-xs justify-start">
                <div className="w-7 h-7 rounded bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Grounding response against system telemetry...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Chips */}
          <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-500 font-mono shrink-0 pl-1">Ask:</span>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-750 transition-colors whitespace-nowrap"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                language === 'ne'
                  ? 'प्रणालीको तथ्याङ्कबारे सोध्नुहोस्...'
                  : 'Ask a grounded question about cut-off settlements, bridges, or damage...'
              }
              className="flex-1 bg-slate-900 border border-slate-750 rounded-md px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="p-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 text-black rounded-md transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right: Verified System Facts Panel (Mandatory Architecture Invariant) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-slate-100 text-sm">
                  Verified System Facts (Active Grounding)
                </h3>
              </div>
              <DemoBadge label="SYSTEM TELEMETRY" variant="slate" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              The Copilot is strictly bounded by the validated JSON facts below. In Prompt 1, deterministic pattern matching returns verified metrics. In future prompts, the LLM prompt wrapper injects this JSON object into system instructions.
            </p>

            {/* Facts Readout Box */}
            <div className="p-3 bg-slate-950 rounded border border-slate-850 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Monitored Area:</span>
                <span className="text-slate-200">{VERIFIED_SYSTEM_FACTS.totalMonitoredAreaKm2} km²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Detected Affected Area:</span>
                <span className="text-cyan-400 font-bold">{VERIFIED_SYSTEM_FACTS.totalAffectedAreaKm2} km²</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Damaged Buildings:</span>
                <span className="text-amber-400 font-bold">{VERIFIED_SYSTEM_FACTS.estimatedDamagedBuildings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Roads Severed:</span>
                <span className="text-rose-400 font-bold">{VERIFIED_SYSTEM_FACTS.affectedRoadsKm} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Compromised Bridges:</span>
                <span className="text-rose-400 font-bold">{VERIFIED_SYSTEM_FACTS.affectedBridgesCount} of 9</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cut-Off Settlements:</span>
                <span className="text-rose-400 font-bold">{VERIFIED_SYSTEM_FACTS.cutOffSettlementsCount} of 12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cut-Off Population:</span>
                <span className="text-slate-200">~{VERIFIED_SYSTEM_FACTS.cutOffPopulationEstimate.toLocaleString()} [DEMO]</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Top Priority Settlements:</span>
                <span className="text-cyan-300 font-sans text-xs">
                  {VERIFIED_SYSTEM_FACTS.topPrioritySettlements.join(', ')}
                </span>
              </div>
            </div>

            {/* Invariant Policy */}
            <div className="p-3 bg-slate-950 rounded border border-slate-850 text-xs space-y-1">
              <span className="font-semibold text-slate-300">Guardrail Rules:</span>
              <ul className="list-disc list-inside text-slate-400 space-y-0.5 text-[11px]">
                <li>Never estimate flood depth without calibrated bathymetry.</li>
                <li>Never invent casualties or unmeasured village populations.</li>
                <li>Always state when optical verification was limited by cloud cover.</li>
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500 text-center">
            Grounded on Trishuli 2026-08-26 Ingestion Bundle
          </div>
        </div>
      </div>
    </div>
  );
};
