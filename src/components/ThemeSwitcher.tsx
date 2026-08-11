import React, { useState, useRef, useEffect } from 'react';
import { Palette, Moon, Sun, Contrast, Zap, Check } from 'lucide-react';

export type ThemeMode = 'midnight' | 'light' | 'high-contrast' | 'cobalt';

export interface ThemeOption {
  id: ThemeMode;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colorPreview: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'midnight',
    name: 'Midnight Slate',
    description: 'Deep obsidian dark mode (Default)',
    icon: Moon,
    colorPreview: 'bg-slate-950 border-cyan-500'
  },
  {
    id: 'light',
    name: 'Light Minimal',
    description: 'Crisp bright canvas with high contrast',
    icon: Sun,
    colorPreview: 'bg-slate-100 border-indigo-600'
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'OLED pure black with stark white borders',
    icon: Contrast,
    colorPreview: 'bg-black border-white'
  },
  {
    id: 'cobalt',
    name: 'Cobalt Cyber',
    description: 'Deep navy dusk with vivid cyan highlights',
    icon: Zap,
    colorPreview: 'bg-indigo-950 border-cyan-400'
  }
];

interface ThemeSwitcherProps {
  currentTheme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = THEME_OPTIONS.find(t => t.id === currentTheme) || THEME_OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700/80 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        title="Switch UI Theme Profile"
      >
        <Palette className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline-block font-semibold">{activeOption.name}</span>
        <ActiveIcon className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-slate-900 border border-slate-700/80 ring-1 ring-black ring-opacity-5 z-50 divide-y divide-slate-800/80 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3.5 py-2.5 bg-slate-950/60 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-400" />
              <span>Theme Profile</span>
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
              4 Profiles
            </span>
          </div>

          <div className="py-1.5 px-1 space-y-0.5">
            {THEME_OPTIONS.map((theme) => {
              const Icon = theme.icon;
              const isSelected = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    onThemeChange(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className={`w-4 h-4 rounded-full border-2 ${theme.colorPreview} shrink-0`} />
                    <div className="truncate">
                      <div className="flex items-center space-x-1.5">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                        <span className="font-medium text-slate-200">{theme.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-indigo-400 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
