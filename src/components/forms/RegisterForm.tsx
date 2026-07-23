import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { ShieldCheck, User, Mail, Lock, ArrowRight, CheckCircle2, Building2 } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Account registration submitted! Logging in automatically...');
    navigateTo('dashboard');
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e8e7f1] shadow-lg overflow-hidden max-w-xl mx-auto my-8 p-8 space-y-6">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#00288e]/10 text-[#00288e] flex items-center justify-center font-bold mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-[#1a1b22]">Register Student Account</h2>
        <p className="text-xs text-[#757684]">Connect your university ID to access lost item claim verification</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Full Legal Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757684]" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full pl-9 pr-3 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">University Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757684]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@university.edu"
                className="w-full pl-9 pr-3 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Student / Staff ID</label>
            <input
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. SID-984021"
              className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Department / Major</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
          >
            <option value="Computer Science">Computer Science & Engineering</option>
            <option value="Bioengineering">Bioengineering & Medicine</option>
            <option value="Business & Finance">Haas School of Business</option>
            <option value="Humanities & Literature">Humanities & Social Sciences</option>
            <option value="Physics & Math">Physics & Applied Math</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Create Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757684]" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full pl-9 pr-3 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[#00288e] text-white font-bold text-xs rounded-xl hover:bg-[#1e40af] transition-colors flex items-center justify-center space-x-2 shadow-xs"
        >
          <span>Complete Registration</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <p className="text-center text-xs text-[#757684]">
        Already registered?{' '}
        <button onClick={() => navigateTo('login')} className="text-[#00288e] font-bold hover:underline">
          Sign In
        </button>
      </p>

    </div>
  );
};
