import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  MapPin,
  Navigation,
  Check
} from 'lucide-react';
import type { Problem, District, Category, UrgencyLevel, User, Language, ThemeMode } from '../types';
import { addNewProblem } from '../utils/storage';
import { soundEngine } from '../utils/audio';
import { TRANSLATIONS, getDistrictLabel, getCategoryLabel } from '../i18n/translations';

interface AddProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemAdded: (problem: Problem) => void;
  currentUser?: User | null;
  language?: Language;
  theme?: ThemeMode;
}

export const AddProblemModal: React.FC<AddProblemModalProps> = ({
  isOpen,
  onClose,
  onProblemAdded,
  currentUser,
  language = 'ru',
  theme = 'light',
}) => {
  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;
  const isDark = theme === 'dark';

  const districts: District[] = ['Аль-Фарабийский', 'Енбекшинский', 'Абайский', 'Каратауский', 'Туран'];
  const categories: { id: Category; label: string }[] = [
    { id: 'roads', label: getCategoryLabel('roads', language) },
    { id: 'lighting', label: getCategoryLabel('lighting', language) },
    { id: 'garbage', label: getCategoryLabel('garbage', language) },
    { id: 'utilities', label: getCategoryLabel('utilities', language) },
    { id: 'ecology', label: getCategoryLabel('ecology', language) },
    { id: 'infrastructure', label: getCategoryLabel('infrastructure', language) },
  ];

  const presetsPhotos = [
    { name: 'Яма / Дорога', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80' },
    { name: 'Открытый люк', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?w=800&auto=format&fit=crop&q=80' },
    { name: 'Свалка мусора', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80' },
    { name: 'Фонарь / Освещение', url: 'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=800&auto=format&fit=crop&q=80' },
    { name: 'Труба / ЖКХ', url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80' },
  ];

  const landmarks = [
    { name: 'пл. Аль-Фараби (Шымкент Плаза)', lat: 42.3185, lng: 69.5899, district: 'Аль-Фарабийский' as District },
    { name: 'Арбат (пр. Бейбитшилик)', lat: 42.3211, lng: 69.5932, district: 'Аль-Фарабийский' as District },
    { name: 'мкр. Нурсат (Акимат / Shymkent Arena)', lat: 42.3712, lng: 69.6275, district: 'Каратауский' as District },
    { name: 'мкр. Самал-2', lat: 42.3482, lng: 69.6012, district: 'Абайский' as District },
    { name: 'ул. Жибек Жолы (Рынок Колос)', lat: 42.3289, lng: 69.6241, district: 'Енбекшинский' as District },
  ];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState<District>('Аль-Фарабийский');
  const [category, setCategory] = useState<Category>('roads');
  const [urgency, setUrgency] = useState<UrgencyLevel>('high');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(42.3185);
  const [lng, setLng] = useState(69.5899);
  const [imageUrl, setImageUrl] = useState(presetsPhotos[0].url);
  const [isLocating, setIsLocating] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGpsLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setAddress(`GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          alert('Не удалось определить GPS. Выберите ориентир из списка.');
        }
      );
    }
  };

  const handleSelectLandmark = (item: typeof landmarks[0]) => {
    setLat(item.lat);
    setLng(item.lng);
    setDistrict(item.district);
    setAddress(item.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !address.trim()) {
      alert('Заполните обязательные поля');
      return;
    }
    soundEngine.playSuccess();
    const newProblem = addNewProblem({
      title: title.trim(),
      description: description.trim() || 'Описание отсутствует',
      district,
      category,
      imageUrl,
      locationLat: lat,
      locationLng: lng,
      address: address.trim(),
      status: 'open',
      urgencyLevel: urgency,
      authorId: currentUser?.id,
      authorName: currentUser?.name,
    });
    onProblemAdded(newProblem);
    onClose();
  };

  // ── Style tokens ─────────────────────────────────────────────────────────
  const bg      = isDark ? 'bg-[#131B2E]' : 'bg-white';
  const overlay = isDark ? 'bg-black/70' : 'bg-slate-900/40';
  const border  = isDark ? 'border-slate-700' : 'border-slate-200';
  const divider = isDark ? 'border-slate-700/80' : 'border-slate-200';
  const headTitle  = isDark ? 'text-white' : 'text-slate-900';
  const headSub    = isDark ? 'text-slate-400' : 'text-slate-500';
  const lbl        = isDark ? 'text-slate-300' : 'text-slate-700';
  const inputCls   = isDark
    ? 'bg-[#0B0F19] border-slate-800 text-white placeholder:text-slate-600 focus:border-emerald-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500';
  const selectCls  = isDark
    ? 'bg-[#0B0F19] border-slate-800 text-white focus:border-emerald-500'
    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500';
  const closeBtnCls = isDark
    ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
    : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100';
  const stepActive  = 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20';
  const stepIdle    = isDark
    ? 'bg-[#0B0F19] text-slate-400 hover:text-white border border-slate-800'
    : 'bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-300';
  const urgencyActive = isDark
    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
    : 'bg-rose-50 text-rose-700 border border-rose-400';
  const urgencyIdle   = isDark
    ? 'bg-[#0B0F19] text-slate-400 border border-slate-800 hover:text-white'
    : 'bg-slate-50 text-slate-600 border border-slate-300 hover:text-slate-900';
  const landmarkActive = isDark
    ? 'bg-emerald-500/10 border-emerald-500/50 text-white'
    : 'bg-emerald-50 border-emerald-400 text-slate-900';
  const landmarkIdle   = isDark
    ? 'bg-[#0B0F19]/60 border-slate-800 text-slate-400 hover:text-white hover:bg-[#0B0F19]'
    : 'bg-slate-50 border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-white';
  const nextBtnCls = isDark
    ? 'bg-slate-800 hover:bg-slate-700 text-white'
    : 'bg-slate-900 hover:bg-slate-800 text-white';
  const backBtnCls = isDark
    ? 'bg-[#0B0F19] border border-slate-800 text-slate-400 hover:text-white'
    : 'bg-slate-100 border border-slate-300 text-slate-500 hover:text-slate-900';
  const previewBoxCls = isDark
    ? 'bg-[#0B0F19] border-slate-800'
    : 'bg-slate-50 border-slate-200';
  const uploadBoxCls = isDark
    ? 'border-slate-700 hover:border-emerald-500/60 bg-[#0B0F19]/60'
    : 'border-slate-300 hover:border-emerald-500 bg-slate-50';
  const uploadIconCls = isDark
    ? 'bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10'
    : 'bg-slate-200 text-slate-500 group-hover:text-emerald-600 group-hover:bg-emerald-50';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 ${overlay} backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto`}>
      <div className={`relative w-full max-w-xl ${bg} border ${border} rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 my-8`}>

        {/* Header */}
        <div className={`flex items-center justify-between border-b pb-4 ${divider}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400' : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${headTitle}`}>{t('addProblemTitle')}</h3>
              <p className={`text-xs mt-0.5 ${headSub}`}>{t('addProblemSubtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors cursor-pointer ${closeBtnCls}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, label: t('step1') },
            { num: 2, label: t('step2') },
            { num: 3, label: t('step3') },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as 1 | 2 | 3)}
              className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                step === s.num ? stepActive : stepIdle
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">

              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${lbl}`}>{t('problemTitleLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('problemTitlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none transition-colors ${inputCls}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${lbl}`}>{t('districtLabel')}</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value as District)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none transition-colors ${selectCls}`}
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>{getDistrictLabel(d, language)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-semibold ${lbl}`}>{t('categoryLabel')}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none transition-colors ${selectCls}`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${lbl}`}>{t('urgencyLabel')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'critical' as UrgencyLevel, label: `🚨 ${t('urgencyCritical')}` },
                    { id: 'high' as UrgencyLevel, label: `⚠️ ${t('urgencyHigh')}` },
                    { id: 'medium' as UrgencyLevel, label: `🛠️ ${t('urgencyMedium')}` },
                  ].map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setUrgency(u.id)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        urgency === u.id ? urgencyActive : urgencyIdle
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${lbl}`}>{t('descriptionLabel')}</label>
                <textarea
                  rows={3}
                  placeholder={t('descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs focus:outline-none resize-none transition-colors ${inputCls}`}
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${nextBtnCls}`}
              >
                {t('nextLocation')} →
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className={`text-xs font-semibold ${lbl}`}>{t('addressInputLabel')}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={t('addressInputPlaceholder')}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`flex-1 border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition-colors ${inputCls}`}
                  />
                  <button
                    type="button"
                    onClick={handleGpsLocation}
                    disabled={isLocating}
                    className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{isLocating ? t('gpsSearching') : t('gpsButton')}</span>
                  </button>
                </div>
                <p className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {t('gpsCoordinates')} {lat.toFixed(4)}, {lng.toFixed(4)}
                </p>
              </div>

              <div className="space-y-2">
                <label className={`text-xs font-semibold ${lbl}`}>{t('quickLandmark')}</label>
                <div className="space-y-1.5">
                  {landmarks.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleSelectLandmark(item)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                        address === item.name ? landmarkActive : landmarkIdle
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-medium">{item.name}</span>
                      </span>
                      <span className={`text-[10px] ${headSub}`}>{getDistrictLabel(item.district, language)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={`w-1/3 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all ${backBtnCls}`}
                >
                  ← {t('back')}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className={`w-2/3 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${nextBtnCls}`}
                >
                  {t('nextPhoto')} →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-2">
                <label className={`text-xs font-semibold ${lbl}`}>{t('photoLabel')}</label>

                {/* Upload box */}
                <label className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group ${uploadBoxCls}`}>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${uploadIconCls}`}>
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <span className={`text-xs font-bold block ${headTitle}`}>{t('photoUploadTitle')}</span>
                    <span className={`text-[10px] ${headSub}`}>{t('photoUploadSubtitle')}</span>
                  </div>
                </label>

                {/* Preset photos */}
                <div className="space-y-1.5 pt-1">
                  <span className={`text-[11px] font-medium block ${headSub}`}>{t('presetPhotos')}</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {presetsPhotos.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                          imageUrl === preset.url
                            ? 'border-emerald-500 ring-2 ring-emerald-500/40 scale-105'
                            : isDark ? 'border-slate-800 opacity-60 hover:opacity-100' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                        title={preset.name}
                      >
                        <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                        {imageUrl === preset.url && (
                          <div className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card preview */}
              <div className={`p-3.5 rounded-2xl border space-y-2 ${previewBoxCls}`}>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${headSub}`}>{t('cardPreview')}</span>
                <div className="flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-300"
                  />
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <h4 className={`text-xs font-bold truncate ${headTitle}`}>
                      {title || 'Название проблемы...'}
                    </h4>
                    <p className={`text-[10px] truncate ${headSub}`}>
                      📍 {address || 'Шымкент'}, {getDistrictLabel(district, language)}
                    </p>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-600 font-bold">
                        Новая заявка
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={`w-1/3 py-3.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${backBtnCls}`}
                >
                  ← {t('back')}
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white text-xs font-black shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  {t('publishButton')}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};
