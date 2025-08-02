import { useState, useRef, useEffect } from 'react';

function ExpandableText({ 
  text, 
  maxLines = 3, 
  className = 'item-field-value',
  showExpandButton = true 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      const element = textRef.current;
      const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
      const maxHeight = lineHeight * maxLines;
      
      // Verificar si el texto está siendo truncado
      setIsOverflowing(element.scrollHeight > maxHeight);
    }
  }, [text, maxLines]);

  if (!text || text.toString().trim() === '') {
    return <span className={className}>-</span>;
  }

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <div
        ref={textRef}
        className={`${className} ${isExpanded ? 'expanded' : ''} ${
          isOverflowing && !isExpanded ? 'item-field-value-long' : ''
        }`}
        style={{
          maxHeight: isExpanded ? 'none' : `${maxLines * 1.4}em`,
          lineHeight: '1.4',
        }}
      >
        {text}
      </div>
      
      {isOverflowing && showExpandButton && (
        <button
          className="expand-button"
          onClick={handleToggle}
          type="button"
        >
          {isExpanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
}

export default ExpandableText;
