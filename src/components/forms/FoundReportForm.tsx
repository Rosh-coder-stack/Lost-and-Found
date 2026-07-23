import React, { useState } from 'react';
import { useItems } from '../../context/ItemContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { Stepper } from '../ui/Stepper';
import { BoundingMapWidget } from '../ui/BoundingMapWidget';
import { ITEM_CATEGORIES, CAMPUS_BUILDINGS } from '../../utils/constants';
import { ItemCategory } from '../../types';
import { PlusCircle, ArrowRight, ArrowLeft, CheckCircle2, Upload, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

export const FoundReportForm: React.FC = () => {
  const { addItemReport } = useItems();
  const { currentUser } = useAuth();
  const { navigateTo } = useNavigation();

  const [step, setStep] = useState(1);
  const [submittedItem, setSubmittedItem] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [primaryColor, setPrimaryColor] = useState('Silver');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState(CAMPUS_BUILDINGS[0]);
  const [roomOrArea, setRoomOrArea] = useState('');
  const [storageLocation, setStorageLocation] = useState('Student Union Information Desk');
  const [dateReported, setDateReported] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuBV6AjX73OcB5FH56zIsJ_0oSQ_j0a19Ffh3f6ucUWrA6H1Bhq4R6m8xItB4RTLCO6wD4SwmDK6aRkWPkHZJEG1_FflE5ObbKOKxYo1ztlMcjfx08kH51T6bu4A_FOG90Aq-7vf1YDf3AjKaotMECoWva92nc44BXECmvDCzItYW7VOqsFBStFvCalVVPe6byeOkQ4k_GmR31lbHZjH3ByIbZPr4yQ-4D0pxMBMW73N3hXuYQFnBwdmUN09sVqmwFJmxfF3bWV0myA');

  const steps = ['1. Item Details', '2. Location & Storage', '3. Photo & Confirm'];

  const presetImages = [
    { label: 'MacBook / Laptop', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBV6AjX73OcB5FH56zIsJ_0oSQ_j0a19Ffh3f6ucUWrA6H1Bhq4R6m8xItB4RTLCO6wD4SwmDK6aRkWPkHZJEG1_FflE5ObbKOKxYo1ztlMcjfx08kH51T6bu4A_FOG90Aq-7vf1YDf3AjKaotMECoWva92nc44BXECmvDCzItYW7VOqsFBStFvCalVVPe6byeOkQ4k_GmR31lbHZjH3ByIbZPr4yQ-4D0pxMBMW73N3hXuYQFnBwdmUN09sVqmwFJmxfF3bWV0myA' },
    { label: 'Keys & Lanyard', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQxEAz6H9uNRGyE9H1mBXRIBrUD93NoVfItLxByLidab8PYu4B4nTvXUuYbeWu-zAQFbbxWLvqW1IRBJweP57k5QblaUJh7YePKiv_izekErwgu85x82qXP2pt5rhERV3KO_EAWwC0KC2-JkqL412UVA64TlLdaElJHxm3q53YBR1fPWKfDgzg8YvROQFA5BXqpSHoLVptXA_k2nqFXhwKP90J-f8uOwXLpXOI0-V_edEQ5lr9iIkMFjFEXIBecpvsPjve5O0_AP4' },
    { label: 'Hydro Flask', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAdd6DDoBVMxXVvgGgp9DQoaE2MquEBBCqkIAMh3fB70VC-J7UtBcyqVxMdwlylWyw2-xivxwApxhnXFLxqll_aGGGDrm9AdL6E4eNbKr6Q9UtGPCYDWVu5ec4Mt_drPZjzxvf8FunwVTm35kdpIu48PBqotKwlrylMCQh3aDsoOpz5_ydSezIUxBSDKo8wCoFMbmIQiAUvGaHLHXMgyvwGWSqcRYdL94UTqL8vkaPf0RIQpM7Yjbs4GSWIPeh8Elg43qXg1IfhnM' },
    { label: 'AirPods Case', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDG2CVIw4ECB-uni_gDHCF6a2FFqpd-euJhqm1vqeO4iYrnewwgnGS-n2kaND1UhFpUeG6lXVOZM_Eg8XJHy9EcgGdTm1pHa6IghX6fhVB-2otcZOzvUNkBT8ly42GlLXUQLPif5nuFhPal1PpwWZv9GoiUID9nhxTFsnLDNcFgEVC7ZbeVIwie83GU6CG5WCXeb_BGNNK5hidGD-m8qgWGGo3FFXlcaX_SFSnf6mLrR5wxX8Gclfmh41Z2s6AKrqaHmfCsSr-DO0o' },
    { label: 'Backpack', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_heKrnbxqoSZNYWFNICQ3XpJCoLolSmTV8Sxu6024aqlbaJD_Urx_sTyCc6XYfmlmwtST_Mvx1kMXXpSs376XesMlkVdFl6g96dTRDovr3ZUbYe_71X4n4mcvTewtYKGHNalVJn3KoPugku8pniu-GFTo6cPlUaGDS7xQfzPw7d0EjcrzP-jYbfStiHu77PmS14VJurvd3IiQgom6NdCjekOmgr6lKfsbqTuGhLXMMLLduu5I6tYa_Z0aBWjNpxc3grWYFjkekZs' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addItemReport({
      title: title || 'Found Item on Campus',
      category,
      type: 'found',
      status: 'active',
      description,
      primaryColor,
      location: {
        building,
        roomOrArea,
        campusZone: 'Library Complex',
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
      storageLocation,
      tags: [category, building, 'Found'],
    });

    setSubmittedItem(created.id);
  };

  if (submittedItem) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e7f1] p-8 text-center max-w-xl mx-auto my-8 shadow-sm space-y-4">
        <div className="w-16 h-16 bg-blue-100 text-[#00288e] rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#1a1b22]">Found Item Registered!</h2>
        <p className="text-xs text-[#505f76] max-w-md mx-auto leading-relaxed">
          Thank you for helping keep our campus honest and safe! Your found report is now listed on the university catalog.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigateTo('item-details', submittedItem)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00288e] text-white font-bold text-xs hover:bg-[#1e40af] transition-colors"
          >
            View Item Listing
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#e8e7f1] text-xs font-semibold text-[#1a1b22] hover:bg-[#f4f2fc]"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e8e7f1] p-6 max-w-3xl mx-auto shadow-xs">
      
      {/* Form Header */}
      <div className="flex items-center space-x-3 pb-4 border-b border-[#eeedf7]">
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#00288e] flex items-center justify-center font-bold">
          <PlusCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-black text-[#1a1b22]">Report a Found Item</h2>
          <p className="text-xs text-[#757684]">Log an item you discovered on campus so the owner can claim it</p>
        </div>
      </div>

      <Stepper steps={steps} currentStep={step} />

      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        
        {/* Step 1: Item Details */}
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
                placeholder="e.g. Silver MacBook Pro 14 inch in quiet study room"
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
                <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Color / Finish</label>
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="e.g. Silver / Navy Blue"
                  className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Where was it resting? Any distinct marks or stickers? (Avoid revealing secret passcode hints)"
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Location & Storage */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">
                Found Building / Location <span className="text-rose-500">*</span>
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
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Room / Specific Area</label>
              <input
                type="text"
                value={roomOrArea}
                onChange={(e) => setRoomOrArea(e.target.value)}
                placeholder="e.g. 2nd floor quiet study area, bench near fountain"
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">
                Safe Storage Location / Turn-in Desk
              </label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="e.g. Handed to MLK Student Union Desk #3 or Kept with me"
                className="w-full px-3.5 py-2.5 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>

            {/* Interactive Campus Location Selector */}
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

        {/* Step 3: Photo & Confirm */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-2">Select Item Photo</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {presetImages.map((img) => (
                  <div
                    key={img.label}
                    onClick={() => setImageUrl(img.url)}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all p-1 bg-[#f4f2fc] ${
                      imageUrl === img.url ? 'border-[#00288e] ring-2 ring-[#00288e]/20' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="h-24 w-full object-cover rounded-lg" />
                    <p className="text-[11px] font-bold text-center mt-1 truncate text-[#1a1b22]">{img.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1a1b22] uppercase mb-1">Or Direct Photo Link URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#f4f2fc] border border-[#e8e7f1] rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-[#00288e] outline-none"
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#00288e] shrink-0 mt-0.5" />
              <span>
                Verified listing: Campus safety administrators will review this post to match against reported lost valuables.
              </span>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
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
              className="px-6 py-2.5 rounded-xl bg-[#00288e] text-white text-xs font-bold hover:bg-[#1e40af] flex items-center space-x-1 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Found Listing</span>
            </button>
          )}
        </div>

      </form>

    </div>
  );
};
