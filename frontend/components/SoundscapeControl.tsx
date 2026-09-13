'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Disc, Radio, Sliders, ChevronDown } from 'lucide-react';
import { soundscape, SoundTrack } from '../lib/soundscape';
import { toast } from 'sonner';

interface SoundOption {
  id: SoundTrack;
  label: string;
  icon: typeof CloudRain;
  description: string;
}

const SOUND_TRACKS: SoundOption[] = [
  { id: 'none', label: 'Silence', icon: VolumeX, description: 'Quiet night' },
  { id: 'rain', label: 'Rain on Glass', icon: CloudRain, description: 'Soft midnight downpour' },
  { id: 'train', label: 'Distant Train', icon: Radio, description: 'Rhythmic wheels on rail' },
  { id: 'tape', label: 'Tape Hiss', icon: Disc, description: 'Vintage lo-fi cassette warmth' },
];

export default function SoundscapeControl() {
  const [activeTrack, setActiveTrack] = useState<SoundTrack>('none');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(45);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTrack = (track: SoundTrack) => {
    if (!soundscape) return;

    if (track === activeTrack) {
      soundscape.stop();
      setActiveTrack('none');
      toast('Ambient soundscape paused', {
        description: 'Returning to quiet silence.',
      });
    } else {
      soundscape.play(track);
      setActiveTrack(track);
      const selected = SOUND_TRACKS.find((s) => s.id === track);
      if (selected && track !== 'none') {
        toast(`Playing: ${selected.label}`, {
          icon: '🎧',
          description: selected.description,
        });
      }
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (soundscape) {
      soundscape.setVolume(newVol / 100);
    }
  };

  const currentOption = SOUND_TRACKS.find((s) => s.id === activeTrack) || SOUND_TRACKS[0];
  const isPlaying = activeTrack !== 'none';
  const CurrentIcon = isPlaying ? currentOption.icon : Volume2;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Ambient Soundscapes"
        aria-label="Ambient soundscapes"
        className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs transition-all duration-300 select-none cursor-pointer ${
          isPlaying
            ? 'bg-[#7C99B8]/20 border-[#7C99B8]/50 text-[#7C99B8] shadow-[0_0_15px_rgba(124,153,184,0.25)]'
            : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08] hover:border-white/[0.15] text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <CurrentIcon
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            isPlaying ? 'animate-pulse text-[#7C99B8]' : 'group-hover:scale-110'
          }`}
        />
        <span className="hidden sm:inline font-mono text-[11px] tracking-wide">
          {isPlaying ? currentOption.label : 'Audio'}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-neutral-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Frosted Twilight Floating Modal Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-[#0d1017]/95 backdrop-blur-2xl border border-white/[0.1] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(124,153,184,0.1)] z-50 animate-fadeIn space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center space-x-1.5 text-xs text-neutral-200 font-medium">
              <Sliders className="w-3.5 h-3.5 text-[#7C99B8]" />
              <span>Night Soundscapes</span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">
              Procedural Web Audio
            </span>
          </div>

          {/* Sound Options List */}
          <div className="space-y-1.5">
            {SOUND_TRACKS.map((track) => {
              const TrackIcon = track.icon;
              const isSelected = activeTrack === track.id;

              return (
                <button
                  type="button"
                  key={track.id}
                  onClick={() => handleSelectTrack(track.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all text-left cursor-pointer border ${
                    isSelected
                      ? 'bg-[#7C99B8]/20 border-[#7C99B8]/40 text-neutral-100 shadow-[0_0_12px_rgba(124,153,184,0.15)]'
                      : 'bg-neutral-900/40 hover:bg-neutral-900/80 border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center border ${
                        isSelected
                          ? 'bg-[#7C99B8]/30 border-[#7C99B8]/50 text-white'
                          : 'bg-neutral-950/60 border-white/[0.06] text-neutral-400'
                      }`}
                    >
                      <TrackIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-medium">{track.label}</div>
                      <div className="text-[10px] text-neutral-500 font-light">
                        {track.description}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="flex h-2 w-2 relative mr-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C99B8] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7C99B8]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Volume Slider */}
          {isPlaying && (
            <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>Volume</span>
                <span>{volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#7C99B8]"
              />
            </div>
          )}

          <div className="text-[10px] text-neutral-500 font-light text-center pt-1 italic font-serif">
            Headphones recommended for reading in the quiet.
          </div>
        </div>
      )}
    </div>
  );
}
