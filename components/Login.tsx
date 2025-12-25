import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const ADMIN_PIN = "2025";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      localStorage.setItem('katsina_coop_auth', 'true');
      onLogin();
    } else {
      setPinError(true);
      // Brief vibration effect via state-triggered animation
      setTimeout(() => setPinError(false), 500);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Immersive Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-600 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400 rounded-full blur-[120px] opacity-30"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10 animate-fadeIn border border-white/10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl transform -rotate-6 transition-transform hover:rotate-0 duration-500">
            <i className="fa-solid fa-building-columns text-white text-3xl"></i>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            Cooperative Society <br/> <span className="text-emerald-600">Admin Portal</span>
          </h1>
          <div className="flex items-center justify-center space-x-2 mt-4">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
             <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">NYSC Katsina State Office</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] block text-center">
              Private Security PIN
            </label>
            <div className="relative">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                autoComplete="off"
                placeholder="• • • •"
                className={`w-full text-center text-4xl tracking-[0.7em] font-black py-6 bg-slate-50 border-2 rounded-3xl transition-all outline-none shadow-inner ${
                  pinError ? 'border-red-500 animate-shake bg-red-50' : 'border-slate-100 focus:border-emerald-500 focus:bg-white'
                }`}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
              {pinError && (
                <p className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-bold text-red-500 uppercase tracking-tighter">
                  Authentication Failed
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={pin.length < 4}
              className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest bg-emerald-600 text-white shadow-2xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-300 transition-all"
            >
              Access Society Cloud
            </button>
          </div>

          <div className="flex items-center justify-center space-x-4 pt-4 opacity-50">
            <div className="flex items-center space-x-1">
              <i className="fa-solid fa-lock text-[10px] text-slate-400"></i>
              <span className="text-[9px] font-black uppercase tracking-tighter">Secure Session</span>
            </div>
            <div className="w-px h-3 bg-slate-200"></div>
            <div className="flex items-center space-x-1">
              <i className="fa-solid fa-cloud-check text-[10px] text-slate-400"></i>
              <span className="text-[9px] font-black uppercase tracking-tighter">Cloud Sync Active</span>
            </div>
          </div>
        </form>
      </div>

      <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
          Official Administrative Portal v2.5
        </p>
      </div>
    </div>
  );
};

export default Login;