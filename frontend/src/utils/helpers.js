export const getSeverityColor = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL':
      return 'text-rose-400 bg-rose-500/20 border-rose-500/30';
    case 'HIGH':
      return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    case 'MEDIUM':
      return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    default:
      return 'text-slate-400 bg-slate-800 border-slate-700';
  }
};
