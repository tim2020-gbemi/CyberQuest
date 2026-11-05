import React, { useState } from 'react';
import { CODEX_CHAPTERS } from '../data/curriculum';
import { sound } from '../audio';
import { voice } from '../speech';
import { BookOpen, X, Laptop, Rocket, ShieldAlert, HeartHandshake, ChevronRight, Volume2, Square } from 'lucide-react';

interface CodexModalProps {
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ onClose }) => {
  const [activeChapterId, setActiveChapterId] = useState(CODEX_CHAPTERS[0].id);
  const [isNarrating, setIsNarrating] = useState(false);

  const activeChapter = CODEX_CHAPTERS.find(c => c.id === activeChapterId) || CODEX_CHAPTERS[0];

  const handleReadChapter = () => {
    sound.playClick();
    if (isNarrating) {
      voice.stop();
      setIsNarrating(false);
    } else {
      setIsNarrating(true);
      const text = `${activeChapter.title}. ${activeChapter.summary}. ` +
        activeChapter.sections.map(s => `${s.heading}: ${s.text}`).join('. ');
      voice.speak(text, true);
    }
  };

  const handleReadSection = (heading: string, text: string) => {
    sound.playClick();
    voice.speak(`${heading}. ${text}`, true);
  };

  const getChapterIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop': return <Laptop className="w-4 h-4" />;
      case 'Rocket': return <Rocket className="w-4 h-4" />;
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4" />;
      case 'HeartHandshake': return <HeartHandshake className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Cyber Scout Handbook</h2>
              <p className="text-xs text-slate-400">Listen or read: your guide to computer science and internet safety</p>
            </div>
          </div>
          <button
            onClick={() => {
              voice.stop();
              sound.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area with Split Column */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 overflow-hidden">
          {/* Left Column: Chapter Index */}
          <div className="md:col-span-4 flex flex-col gap-2 overflow-y-auto pr-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Handbook Chapters
            </span>
            {CODEX_CHAPTERS.map((ch, idx) => {
              const isActive = ch.id === activeChapterId;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    voice.stop();
                    setIsNarrating(false);
                    sound.playClick();
                    setActiveChapterId(ch.id);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-100 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-cyan-500/30 text-cyan-300' : 'bg-slate-900 text-slate-500'}`}>
                      {getChapterIcon(ch.icon)}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate">0{idx + 1}. {ch.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{ch.tag}</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'translate-x-0.5 text-cyan-400' : 'text-slate-600'}`} />
                </button>
              );
            })}

            {/* Mascot Tip Box with Generated Avatar */}
            <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
              <img
                src="/src/assets/images/cyber_hero_byte_1793892005986.jpg"
                alt="Byte Scout Mascot"
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-cyan-500/30"
                referrerPolicy="no-referrer"
              />
              <div className="text-[11px] text-slate-300 leading-tight">
                <span className="font-bold text-cyan-400">Byte's Tip:</span> Click "Listen to Chapter" to have me explain every concept with real voice audio!
              </div>
            </div>
          </div>

          {/* Right Column: Reading Pane */}
          <div className="md:col-span-8 flex flex-col overflow-y-auto pr-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                <span>{activeChapter.tag}</span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-400">Handbook Chapter</span>
              </div>

              {/* Read Aloud Button */}
              <button
                onClick={handleReadChapter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
              >
                {isNarrating ? <Square className="w-3.5 h-3.5 fill-white" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isNarrating ? 'Stop Voice' : 'Listen to Chapter'}</span>
              </button>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{activeChapter.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6 pb-4 border-b border-slate-800">
              {activeChapter.summary}
            </p>

            <div className="space-y-4">
              {activeChapter.sections.map((sec, i) => (
                <div key={i} className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="text-sm font-bold text-cyan-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{sec.heading}</span>
                    </h4>
                    <button
                      onClick={() => handleReadSection(sec.heading, sec.text)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-cyan-950 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      title="Read section aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {sec.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>


        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
