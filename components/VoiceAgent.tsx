import React, { useState, useRef, useEffect } from 'react';
import { getLiveClient } from '../services/geminiService';
import { LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Radio, Volume2, AlertCircle } from 'lucide-react';

// Audio Utils within component to avoid global pollution
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  const uint8 = new Uint8Array(int16.buffer);
  let binary = '';
  const len = uint8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  const b64 = btoa(binary);
  
  return {
    data: b64,
    mimeType: 'audio/pcm;rate=16000',
  } as any; // Type casting for genai-sdk Blob which expects data string
}

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

const VoiceAgent: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Model is speaking
  const [error, setError] = useState<string | null>(null);

  // Refs for audio handling
  const nextStartTime = useRef(0);
  const inputAudioContext = useRef<AudioContext | null>(null);
  const outputAudioContext = useRef<AudioContext | null>(null);
  const sources = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null); // To store the session object
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const connect = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = getLiveClient();
      
      // Initialize Audio Contexts
      inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});

      const outputNode = outputAudioContext.current.createGain();
      outputNode.connect(outputAudioContext.current.destination);

      const sessionPromise = ai.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Live Session Opened');
            setIsConnected(true);
            
            // Setup Input Stream
            if (!inputAudioContext.current) return;
            const source = inputAudioContext.current.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.current.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.current.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Audio Output
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && outputAudioContext.current) {
              setIsSpeaking(true);
              const ctx = outputAudioContext.current;
              nextStartTime.current = Math.max(nextStartTime.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                ctx,
                24000,
                1
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              
              source.addEventListener('ended', () => {
                sources.current.delete(source);
                if (sources.current.size === 0) setIsSpeaking(false);
              });

              source.start(nextStartTime.current);
              nextStartTime.current = nextStartTime.current + audioBuffer.duration;
              sources.current.add(source);
            }

            // Handle Interruption
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              console.log("Interrupted");
              for (const source of sources.current.values()) {
                source.stop();
                sources.current.delete(source);
              }
              nextStartTime.current = 0;
              setIsSpeaking(false);
            }
          },
          onerror: (e: any) => {
             console.error('Live API Error', e);
             setError("Connection error. Please try again.");
             disconnect();
          },
          onclose: (e: any) => {
             console.log('Live Session Closed');
             setIsConnected(false);
          }
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
            },
            systemInstruction: "You are a friendly, witty, and helpful social media assistant named 'Auto'. Keep responses concise and engaging."
        }
      });
      
      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error("Failed to connect", err);
      setError(err.message || "Failed to access microphone or connect to API");
    }
  };

  const disconnect = () => {
    // Close session
    // Note: sessionRef.current.close() might be available depending on SDK version, 
    // but the example instructions say use session.close()
    if (sessionRef.current) {
        // Checking if close method exists as per standard WebSocket-like interfaces
        // Or simply reloading/stopping contexts might be enough if close isn't exposed
    }

    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close Audio Contexts
    if (inputAudioContext.current) {
      inputAudioContext.current.close();
      inputAudioContext.current = null;
    }
    if (outputAudioContext.current) {
      outputAudioContext.current.close();
      outputAudioContext.current = null;
    }

    // Stop Audio Processing
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }

    setIsConnected(false);
    setIsSpeaking(false);
    nextStartTime.current = 0;
    sources.current.clear();
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center shadow-2xl relative overflow-hidden">
        
        {/* Background Animation Pulse */}
        {isConnected && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                 <div className={`w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl transition-all duration-500 ${isSpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`} />
                 <div className={`absolute w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl transition-all duration-700 ${isSpeaking ? 'scale-125' : 'scale-90'}`} />
            </div>
        )}

        <div className="z-10 text-center space-y-2 mb-10">
          <h2 className="text-2xl font-bold text-white">Live Voice Agent</h2>
          <p className="text-slate-400">Have a real-time conversation with Gemini</p>
        </div>

        {/* Visualizer / Status Icon */}
        <div className="z-10 relative mb-12">
           <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
               isConnected 
                 ? (isSpeaking ? 'bg-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.5)]' : 'bg-slate-800 border-2 border-indigo-500/50') 
                 : 'bg-slate-800 border border-slate-700'
           }`}>
               {isConnected ? (
                   isSpeaking ? <Volume2 size={48} className="text-white animate-pulse" /> : <Radio size={48} className="text-indigo-400" />
               ) : (
                   <MicOff size={48} className="text-slate-500" />
               )}
           </div>
           
           {/* Status Badge */}
           <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold border ${
               isConnected 
               ? 'bg-green-500/10 border-green-500/50 text-green-400' 
               : 'bg-slate-800 border-slate-700 text-slate-400'
           }`}>
               {isConnected ? 'LIVE' : 'OFFLINE'}
           </div>
        </div>

        {/* Controls */}
        <div className="z-10 w-full flex flex-col gap-4">
            {!isConnected ? (
                <button 
                    onClick={connect}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-3"
                >
                    <Mic size={20} />
                    Start Conversation
                </button>
            ) : (
                <button 
                    onClick={disconnect}
                    className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-500 rounded-xl font-bold transition-all flex items-center justify-center gap-3"
                >
                    <MicOff size={20} />
                    End Session
                </button>
            )}
        </div>

        {error && (
            <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm max-w-full">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
            </div>
        )}

        <div className="mt-6 text-xs text-slate-500 text-center max-w-xs">
            Powered by Gemini Live API. Low latency native audio streaming.
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;
