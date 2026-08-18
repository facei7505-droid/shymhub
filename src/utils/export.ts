import type { Problem } from '../types';

export function exportProblemsToCSV(problems: Problem[]) {
  const headers = [
    'ID',
    'Название',
    'Район',
    'Категория',
    'Рейтинг Elo',
    'Сыграно дуэлей',
    'Побед',
    'Win Rate (%)',
    'Статус',
    'Адрес',
    'Широта (Lat)',
    'Долгота (Lng)',
    'Дата создания',
  ];

  const rows = problems.map((p) => {
    const winRate = p.matchesPlayed > 0 ? Math.round((p.winsCount / p.matchesPlayed) * 100) : 0;
    return [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.district}"`,
      `"${p.category}"`,
      p.eloRating,
      p.matchesPlayed,
      p.winsCount,
      winRate,
      `"${p.status}"`,
      `"${(p.address || '').replace(/"/g, '""')}"`,
      p.locationLat,
      p.locationLng,
      `"${p.createdAt}"`,
    ].join(',');
  });

  // UTF-8 BOM (\uFEFF) for Excel compatibility with Russian characters
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Battle_of_Problems_Shymkent_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportProblemsToJSON(problems: Problem[]) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(problems, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `Battle_of_Problems_Shymkent_Data_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
