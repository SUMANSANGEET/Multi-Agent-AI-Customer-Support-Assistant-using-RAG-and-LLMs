import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Shield, Key, CheckCircle, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserChange: (user: UserProfile) => void;
}

const PRESET_USERS: UserProfile[] = [
  {
    id: 'user-demo-1',
    name: 'Alex Morgan',
    email: 'alex.morgan@techmart.example',
    role: 'customer',
    plan: 'Pro',
    accountStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'user-agent-1',
    name: 'Sarah Jenkins (Support Lead)',
    email: 's.jenkins@techmart.example',
    role: 'support_agent',
    plan: 'Enterprise',
    accountStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 'user-admin-1',
    name: 'Dr. Marcus Vance (System Administrator)',
    email: 'm.vance@techmart.example',
    role: 'admin',
    plan: 'Enterprise',
    accountStatus: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
  }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const newUser: UserProfile = {
      id: `user-custom-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      role: 'customer',
      plan: 'Pro',
      accountStatus: 'Active'
    };
    onUserChange(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-base text-white">User Authentication & Session Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preset Persona Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
              Switch Persona / Role (Click to Switch)
            </label>
            <div className="space-y-2.5">
              {PRESET_USERS.map((user) => {
                const isSelected = currentUser.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => {
                      onUserChange(user);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-md shadow-indigo-950/50'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm flex items-center space-x-2">
                          <span>{user.name}</span>
                          <span
                            className={`px-2 py-0.5 text-[10px] rounded-full font-semibold uppercase ${
                              user.role === 'admin'
                                ? 'bg-purple-950 text-purple-400 border border-purple-800'
                                : user.role === 'support_agent'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-500 font-semibold">Or Log In With Custom Email</span>
            </div>
          </div>

          {/* Custom Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Jordan Lee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. jordan.lee@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/30"
            >
              Sign In / Start Session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
