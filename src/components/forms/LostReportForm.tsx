import React, { useState } from 'react';
import { useItems } from '../../context/ItemContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Stepper } from '../ui/Stepper';
import { BoundingMapWidget } from '../ui/BoundingMapWidget';
import { ITEM_CATEGORIES, CAMPUS_BUILDINGS } from '../../utils/constants';
import { ItemCategory } from '../../types';
import { AlertTriangle, ArrowRight, ArrowLeft, CheckCircle2, Upload, HelpCircle, MapPin } from 'lucide-react';

export const LostReportForm: React.FC = () => {
  const { addItemReport } = useItems();
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();

  const [step, setStep] = useState(1);
  const [submittedItem, setSubmittedItem] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [brand, setBrand] = useState('');
  const [primaryColor, setPrimaryColor] = useState('Black');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0]);
  const [roomOrArea, setRoomOrArea] = useState('');
  const [dateReported, setDateReported] = useState(new Date().toISOString().split('T')[0]);
  const [contactPreference, setContactPreference] = useState<'in_app' | 'email'>('in_app');
  const [imageUrl, setImageUrl] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuCBSr1x7a9GaSK5j-YGXPJEKsHKEOjix9DiDlDBY6e8HN3eRayNL0ygDNSo0A_N069_vq5DJ8Ocn4VPgAuVpsuchixN4030h24nMQI5ABX-x0QKJeYcmvCOD1JTm9cNWNSvUri4BrHF8FP40Eiz8Pubr6eMi9M9Q47J2NJj2f2b26jM3UQk4T4nZ_V9q7ndE6heZK2l64Lcz2izD4pHceLWP43QS7soZ2LpumpdNPB_JcjRXgeHxqckVuaHNUPuEgWPULql_3sEdSc');

  const steps = ['1. Item Details', '2. Location & Map', '3. Review & Submit'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addItemReport({
      title: title || 'Lost Personal Item',
      category,
      type: 'lost',
      status: 'active',
      description,
      brand,
      primaryColor,
      location: {
        building,
        roomOrArea,
        campusZone: 'Central Quad',
      },
      dateReported,
      imageUrl,
      reportedBy: {
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
        email: currentUser.email,
        role: currentUser.role,
      },
      contactPreference,
      tags: [category, building, primaryColor],
    });

    setSubmittedItem(created.id);
  };

  if (submittedItem) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e7f1] p-8 text-center max-w-xl mx-auto my-8 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-[#1a1b22]">Lost Item Alert Logged!</h2>
        <p className="text-xs text-[#505f76] max-w-md mx-auto leading-relaxed">
          Your report is now live on the university catalog. If anyone reports a matching found item or turns it into campus security, you will receive an instant notification.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigateTo('item-details', submittedItem)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00288e] text-white font-bold text-xs hover:bg-[#1e40af] transition-colors"
          >
            View My Report
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#e8e7f1] text-xs font-semibold text-[#1a1b22] hover:bg-[#f4f2fc]"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e8e7f1] p-6 max-w-3xl mx-auto shadow-xs">
      
      {/* Form Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-[#eeedf7]">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-[#1a1b22]">Report a Lost Item</h2>
          <p className="text-xs text-[#757684]">Help campus security & student finders locate your misplaced item</p>
        </div>
      </div>

      <Stepper steps={steps} currentStep={step} />

      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        
        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">
                Item Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Black Warby Parker Prescription Eyeglasses"
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
                >
                  {ITEM_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Primary Color</label>
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="e.g. Matte Black / Silver"
                  className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Brand / Model (Optional)</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Apple, Bose, Herschel, Hydro Flask"
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Detailed Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe unique marks, stickers, engravings, contents, or circumstances when lost..."
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">
                Last Known Campus Building <span className="text-rose-500">*</span>
              </label>
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              >
                {CAMPUS_BUILDINGS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Specific Room or Area</label>
              <input
                type="text"
                value={roomOrArea}
                onChange={(e) => setRoomOrArea(e.target.value)}
                placeholder="e.g. 2nd Floor Quiet Study Desk #14 or North Courtyard"
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Date Lost</label>
              <input
                type="date"
                value={dateReported}
                onChange={(e) => setDateReported(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>

            {/* Campus Map Pin Selector */}
            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#00288e]" />
                <span>Confirm Pin Location</span>
              </label>
              <BoundingMapWidget
                selectedBuilding={building}
                onSelectBuilding={(b) => setBuilding(b)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-[#f4f2fc] p-4 rounded-xl border border-[#e8e7f1] space-y-2 text-xs">
              <h4 className="font-bold text-[#1a1b22] text-sm">{title || 'Untitled Report'}</h4>
              <p><span className="font-semibold text-[#757684]">Category:</span> {category}</p>
              <p><span className="font-semibold text-[#757684]">Location:</span> {building} ({roomOrArea || 'General Area'})</p>
              <p><span className="font-semibold text-[#757684]">Date Lost:</span> {dateReported}</p>
              <p className="text-[#505f76] italic">"{description || 'No description provided.'}"</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">
                Contact Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setContactPreference('in_app')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    contactPreference === 'in_app'
                      ? 'border-[#00288e] bg-[#eeedf7] text-[#00288e]'
                      : 'border-[#e8e7f1] text-[#444653]'
                  }`}
                >
                  <p>In-App Portal Chat</p>
                  <p className="text-[10px] text-[#757684] font-normal">Keep email address private</p>
                </button>
                <button
                  type="button"
                  onClick={() => setContactPreference('email')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    contactPreference === 'email'
                      ? 'border-[#00288e] bg-[#eeedf7] text-[#00288e]'
                      : 'border-[#e8e7f1] text-[#444653]'
                  }`}
                >
                  <p>Direct University Email</p>
                  <p className="text-[10px] text-[#757684] font-normal">{currentUser.email}</p>
                </button>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                By submitting, your lost item alert will be indexed across campus safety desks. Never share personal security passwords or full credit card numbers.
              </span>
            </div>
          </div>
        )}

        {/* Wizard Footer Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#eeedf7]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-[#e8e7f1] text-xs font-semibold text-[#1a1b22] hover:bg-[#f4f2fc] flex items-center space-x-1"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-[#00288e] text-white text-xs font-bold hover:bg-[#1e40af] flex items-center space-x-1 shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 flex items-center space-x-1 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Lost Report</span>
            </button>
          )}
        </div>

      </form>

    </div>
  );
};
