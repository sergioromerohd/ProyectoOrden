// Componente de iconos mejorados para TopTastic
export const Icons = {
  // Drag handle con estilo moderno - versión más visible para móvil
  DragHandle: () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tres líneas horizontales más gruesas */}
      <rect x="4" y="7" width="16" height="2" rx="1"/>
      <rect x="4" y="11" width="16" height="2" rx="1"/>
      <rect x="4" y="15" width="16" height="2" rx="1"/>
    </svg>
  ),

  // Like con animación
  Like: ({ liked = false }) => (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill={liked ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
      style={{ 
        transition: 'all 0.2s ease',
        filter: liked ? 'drop-shadow(0 0 4px currentColor)' : 'none'
      }}
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
    </svg>
  ),

  // Añadir elemento
  Add: () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),

  // Compartir
  Share: () => (
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16,6 12,2 8,6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  ),

  // Crown mejorada
  Crown: () => (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(0 2px 4px rgba(255, 215, 0, 0.4))'
      }}
    >
      <path d="M5 16l3-8 3.5 5 3.5-5 3 8v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-4z"/>
      <circle cx="7.5" cy="4" r="2"/>
      <circle cx="12" cy="2" r="2"/>
      <circle cx="16.5" cy="4" r="2"/>
    </svg>
  )
};

export default Icons;
