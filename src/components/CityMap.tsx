import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Problem, District, ThemeMode, Language } from '../types';
import { TRANSLATIONS, getDistrictLabel, getCategoryLabel } from '../i18n/translations';
import { handleImageError } from '../utils/images';
import { getPriorityFromElo } from '../utils/priority';

interface CityMapProps {
  problems: Problem[];
  theme?: ThemeMode;
  language?: Language;
}

export const CityMap: React.FC<CityMapProps> = ({
  problems,
  theme = 'dark',
  language = 'ru',
}) => {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(problems[0] || null);
  const [activeDistrict, setActiveDistrict] = useState<string>('all');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const isDark = theme === 'dark';
  const t = (key: string) => TRANSLATIONS[language]?.[key] || key;

  const districts: District[] = ['Аль-Фарабийский', 'Енбекшинский', 'Абайский', 'Каратауский', 'Туран'];

  const filteredProblems = activeDistrict === 'all'
    ? problems
    : problems.filter((p) => p.district === activeDistrict);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [42.3211, 69.5975], // Shymkent Center
        zoom: 12.5,
        zoomControl: false,
      });

      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

      const tiles = L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      tileLayerRef.current = tiles;

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tiles when Theme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const tileUrl = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const newTiles = L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTiles;
  }, [isDark]);

  // Update Markers on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    filteredProblems.forEach((problem) => {
      const isSelected = selectedProblem?.id === problem.id;
      const isHighPriority = problem.eloRating >= 1380;
      const priority = getPriorityFromElo(problem.eloRating, language);

      const markerHtml = `
        <div class="relative group cursor-pointer">
          ${isHighPriority ? '<span class="animate-ping absolute -inset-1 rounded-full bg-rose-500 opacity-75"></span>' : ''}
          <div style="
            width: ${isSelected ? '34px' : '28px'};
            height: ${isSelected ? '34px' : '28px'};
            border-radius: 9999px;
            background: ${isSelected ? '#ffffff' : priority.dotColor};
            color: ${isSelected ? '#0f172a' : '#ffffff'};
            border: 2px solid ${isSelected ? '#e11d48' : '#ffffff'};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 900;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            transition: transform 0.2s;
          ">
            🔥
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-map-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([problem.locationLat, problem.locationLng], {
        icon: customIcon,
      });

      marker.on('click', () => {
        setSelectedProblem(problem);
      });

      marker.addTo(markersLayerRef.current!);
      bounds.extend([problem.locationLat, problem.locationLng]);
    });

    if (filteredProblems.length > 0 && activeDistrict !== 'all') {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [filteredProblems, selectedProblem, activeDistrict, language]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const selectedPriority = selectedProblem ? getPriorityFromElo(selectedProblem.eloRating, language) : null;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 ${
        isDark ? 'border-slate-800/80' : 'border-slate-200'
      }`}>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>{t('mapBadge')}</span>
          </div>
          <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('mapTitle')}
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('mapSubtitle')}
          </p>
        </div>

        {/* District Filter Pill */}
        <div className={`flex items-center gap-1 overflow-x-auto p-1 rounded-2xl border text-xs font-semibold ${
          isDark ? 'bg-[#131B2E] border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveDistrict('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeDistrict === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('entireCity')}
          </button>
          {districts.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDistrict(d)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeDistrict === d
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {getDistrictLabel(d, language).split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Real Leaflet Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Visual Map Canvas with Leaflet */}
        <div className={`lg:col-span-2 relative h-[500px] sm:h-[560px] rounded-3xl border overflow-hidden shadow-2xl ${
          isDark
            ? 'border-slate-800/80 shadow-[0_10px_40px_rgba(0,0,0,0.6)]'
            : 'border-slate-300 shadow-lg'
        }`}>
          
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Zoom Controls */}
          <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#0B0F19]/90 border-slate-700 text-white hover:bg-slate-800'
                  : 'bg-white/95 border-slate-300 text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className={`p-2.5 rounded-xl border backdrop-blur-md shadow-lg transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#0B0F19]/90 border-slate-700 text-white hover:bg-slate-800'
                  : 'bg-white/95 border-slate-300 text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Map Controls / Legend */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 px-3.5 py-2 rounded-2xl border backdrop-blur-md text-xs shadow-xl pointer-events-none">
            <div className={`flex items-center gap-3 ${
              isDark ? 'text-slate-200' : 'text-slate-900 font-semibold'
            }`}>
              <div className="flex items-center gap-1.5 font-bold text-rose-500">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-ping" />
                <span>{t('highUrgency')}</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-amber-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span>{t('mediumUrgency')}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Selected Problem Inspector */}
        <div className={`border rounded-3xl p-6 space-y-4 shadow-xl ${
          isDark ? 'bg-[#131B2E] border-slate-800/80' : 'bg-white border-slate-200'
        }`}>
          {selectedProblem && selectedPriority ? (
            <>
              <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-700/60 bg-slate-900">
                <img
                  src={selectedProblem.imageUrl}
                  alt={selectedProblem.title}
                  onError={(e) => handleImageError(e, selectedProblem.category)}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full backdrop-blur-md border text-xs font-bold ${selectedPriority.badgeClass} bg-slate-950/85`}>
                  {selectedPriority.label}
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700 text-xs text-white font-semibold">
                  {getDistrictLabel(selectedProblem.district, language)}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className={`text-lg font-bold leading-snug ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {selectedProblem.title}
                </h3>
                <p className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {selectedProblem.description}
                </p>
              </div>

              <div className={`pt-2 border-t space-y-2 text-xs ${
                isDark ? 'border-slate-800/80 text-slate-300' : 'border-slate-100 text-slate-700'
              }`}>
                {selectedProblem.address && (
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t('addressLabel')}</span>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedProblem.address}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Категория:</span>
                  <span className="font-semibold text-rose-500">{getCategoryLabel(selectedProblem.category, language)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t('priorityLabel')}</span>
                  <span className={`font-bold ${selectedPriority.label.includes('Критический') || selectedPriority.label.includes('шұғыл') ? 'text-rose-400' : 'text-amber-400'}`}>
                    {selectedPriority.shortLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t('totalDuels')}</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedProblem.matchesPlayed}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${selectedProblem.locationLat},${selectedProblem.locationLng}`,
                    '_blank'
                  );
                }}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border ${
                  isDark
                    ? 'bg-[#1C263E] hover:bg-[#22304F] border-slate-700 text-slate-100'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-900'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{t('openIn2Gis')}</span>
              </button>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">
              {t('selectMarkerHint')}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
