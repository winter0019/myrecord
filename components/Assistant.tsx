
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Contribution } from '../types';

interface AssistantProps {
  contributions: Contribution[];
}

// Audio Decoding/Encoding Utilities
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const Assistant: React.FC<AssistantProps> = ({ contributions }) => {
  const [isLive, setIsLive] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: 'Official Ledger Voice Assistant active. How can I help you today?' }
  ]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    return () => {
      stopLive();
    };
  }, []);

  const stopLive = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsLive(false);
    
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    for (const source of sourcesRef.current) {
      try { source.stop(); } catch (e) {}
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const startLive = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      if (!outAudioContextRef.current) {
        outAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsLive(true);

      const systemInstruction = `You are the Official Digital Ledger Assistant for the NYSC KATSINA STATE STAFF MULTI-PURPOSE COOPERATIVE SOCIETY LIMITED.
      You have real-time access to the current ledger data of the society.
      Total Records: ${contributions.length}.
      Latest Entries: ${JSON.stringify(contributions.slice(-15))}.
      
      Role Guidelines:
      1. Help admins find member balances quickly.
      2. Summarize total equity and projected dividends (5% yield).
      3. Explain that membership requires monthly contributions.
      4. Provide specific answers by querying the provided data.
      5. Speak clearly and professionally.
      
      Data structure reference: Each record has memberName, fileNumber, amount, date, and category.`;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'user') {
                  return [...prev.slice(0, -1), { role: 'user', text: last.text + text }];
                }
                return [...prev, { role: 'user', text }];
              });
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'bot' && last.text !== 'Official Ledger Voice Assistant active...') {
                   return [...prev.slice(0, -1), { role: 'bot', text: last.text + text }];
                }
                return [...prev, { role: 'bot', text }];
              });
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outAudioContextRef.current) {
              const ctx = outAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current) {
                try { source.stop(); } catch(e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            stopLive();
          },
          onclose: () => {
            setIsLive(false);
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start voice assistant:', err);
      alert('Microphone access is required for the voice assistant.');
      setIsLive(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-950 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-10 right-10">
           <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]' : 'bg-slate-800'}`}></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 transition-all duration-700 shadow-2xl border-4 ${
            isLive ? 'bg-emerald-600/20 border-emerald-500 scale-105 shadow-emerald-500/30' : 'bg-slate-900 border-slate-800'
          }`}>
            <i className={`fa-solid ${isLive ? 'fa-waveform-lines' : 'fa-microphone-lines'} text-4xl text-emerald-400`}></i>
          </div>
          <h2 className="text-3xl font-black mb-4 tracking-tight">Katsina Coop Assistant</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed mb-10">
            Real-time voice interface for society records. Speak your queries about member accounts and financial health.
          </p>
          
          <button 
            onClick={isLive ? stopLive : startLive}
            className={`px-12 py-5 rounded-3xl font-black text-sm transition-all shadow-2xl active:scale-95 group relative overflow-hidden ${
              isLive ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-600/20'
            }`}
          >
            <span className="relative z-10">{isLive ? 'Disconnect Voice Session' : 'Initiate Audio Query'}</span>
          </button>
        </div>

        {isLive && (
           <div className="mt-12 flex justify-center space-x-2 h-6 items-center">
             {[...Array(8)].map((_, i) => (
               <div key={i} className="w-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.05}s` }}></div>
             ))}
           </div>
        )}
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[450px]">
        <div className="px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Interaction History</span>
          <button onClick={() => setMessages([{ role: 'bot', text: 'History reset.' }])} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest transition-colors">Clear Logs</button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-5 custom-scrollbar bg-slate-50/20">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-br-none shadow-xl' 
                  : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none shadow-md font-bold'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          <div id="anchor"></div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
