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
  language = 'ru',
}) => {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(problems[0] || null);
  const [activeDistrict, setActiveDistrict] = useState<string>('all');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

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
        center: [42.3211, 69.5975],
        zoom: 12.5,
        zoomControl: false,
      });

      const tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      L.tileLayer(tileUrl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredProblems.forEach((problem) => {
      const priority = getPriorityFromElo(problem.eloRating, language);
      const color = problem.status === 'resolved' ? '#10b981' : problem.urgencyLevel === 'critical' ? '#ef4444' : problem.urgencyLevel === 'high' ? '#f97316' : '#eab308';

      const marker = L.circleMarker([problem.locationLat, problem.locationLng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9,
      });

      marker.bindPopup(`
        <div style="min-width: 200px; font-family: system-ui;">
          <img src="${problem.imageUrl}" alt="${problem.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" onerror="this.src='https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&auto=format&fit=crop&q=80'" />
          <h3 style="margin: 0 0 4px; font-size: 14px; font-weight: 700; color: #0f172a;">${problem.title}</h3>
          <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">${problem.address || ''}</p>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <span style="background: #f1f5f9; color: #0f172a; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">${getCategoryLabel(problem.category, language)}</span>
            <span style="background: ${color}15; color: ${color}; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">${priority.label}</span>
          </div>
        </div>
      `);

      marker.on('click', () => {
        setSelectedProblem(problem);
      });

      markersLayerRef.current!.addLayer(marker);
    });
  }, [filteredProblems, language]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  return (
    <div className="w-full flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-600 text-xs font-bold uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-cyan-500" />
          {t('mapBadge')}
        </div>

        <h2 className="text-3xl font-black tracking-tight text-slate-900">
          {t('mapTitle')}
        </h2>

        <p className="text-xs sm:text-sm max-w-3xl mx-auto text-slate-600">
          {t('mapSubtitle')}
        </p>
      </div>

      {/* District Filter Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setActiveDistrict('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeDistrict === 'all'
              ? 'bg-cyan-500 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {t('entireCity')}
        </button>
        {districts.map((d) => (
          <button
            key={d}
            onClick={() => setActiveDistrict(d)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDistrict === d
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {getDistrictLabel(d, language)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
          <div ref={mapContainerRef} className="w-full h-[400px] sm:h-[500px]" />

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
              title="Увеличить"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
              title="Уменьшить"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Problem Detail Panel */}
        <div className="lg:col-span-1">
          {selectedProblem ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="relative h-48 sm:h-56">
                <img
                  src={selectedProblem.imageUrl}
                  alt={selectedProblem.title}
                  onError={(e) => handleImageError(e, selectedProblem.category)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-white/90 text-slate-900 text-[10px] font-bold">
                    {getCategoryLabel(selectedProblem.category, language)}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                  {selectedProblem.title}
                </h3>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{selectedProblem.address || 'Шымкент'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 mb-0.5">{t('priorityLabel')}</div>
                    <div className="text-xs font-bold text-slate-900">
                      {getPriorityFromElo(selectedProblem.eloRating, language).label}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 mb-0.5">{t('statusLabel')}</div>
                    <div className="text-xs font-bold text-slate-900">
                      {selectedProblem.status === 'resolved' ? 'Устранено' : selectedProblem.status === 'in_progress' ? 'В работе' : 'В очереди'}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3">
                  {selectedProblem.description}
                </p>

                <a
                  href={`https://maps.google.com/?q=${selectedProblem.locationLat},${selectedProblem.locationLng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t('openIn2Gis')}
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 text-center text-slate-500 text-sm">
              Выберите маркер на карте для просмотра деталей проблемы
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
