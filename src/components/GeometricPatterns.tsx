interface GeometricPatternsProps {
  type: 'x-grid' | 'chevrons-left' | 'chevrons-right' | 'zigzag' | 'triangle';
  color?: 'primary' | 'white' | 'black' | 'muted';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  className?: string;
}

const GeometricPatterns = ({ 
  type, 
  color = 'white', 
  size = 'md',
  opacity = 30,
  className = '' 
}: GeometricPatternsProps) => {
  const colorClasses = {
    primary: 'text-primary',
    white: 'text-ski-white',
    black: 'text-ski-black',
    muted: 'text-muted-foreground'
  };

  const sizeClasses = {
    sm: 'text-2xl md:text-4xl',
    md: 'text-4xl md:text-6xl',
    lg: 'text-5xl md:text-7xl',
    xl: 'text-6xl md:text-8xl'
  };

  const colorClass = colorClasses[color];
  const sizeClass = sizeClasses[size];
  const opacityStyle = { opacity: opacity / 100 };

  const renderPattern = () => {
    switch (type) {
      case 'x-grid':
        return (
          <div className={`font-bold ${sizeClass} ${colorClass} leading-none`} style={opacityStyle}>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <span>×</span>
                <span>×</span>
                <span>×</span>
                <span>×</span>
                <span>×</span>
              </div>
              <div className="flex gap-1">
                <span>×</span>
                <span>×</span>
                <span>×</span>
                <span>×</span>
                <span>×</span>
              </div>
              <div className="flex gap-1">
                <span>×</span>
                <span>×</span>
                <span>×</span>
                <span>×</span>
                <span>×</span>
              </div>
            </div>
          </div>
        );

      case 'chevrons-left':
        return (
          <div className={`font-bold ${sizeClass} ${colorClass} leading-none`} style={opacityStyle}>
            <div className="flex flex-col gap-1">
              <div>‹‹‹</div>
              <div className="ml-2">‹‹‹</div>
              <div className="ml-4">‹‹‹</div>
            </div>
          </div>
        );

      case 'chevrons-right':
        return (
          <div className={`font-bold ${sizeClass} ${colorClass} leading-none`} style={opacityStyle}>
            <div className="flex flex-col gap-1">
              <div>›››</div>
              <div className="mr-2">›››</div>
              <div className="mr-4">›››</div>
            </div>
          </div>
        );

      case 'zigzag':
        return (
          <div className={`font-bold ${sizeClass} ${colorClass} leading-none`} style={opacityStyle}>
            <svg 
              width="100" 
              height="40" 
              viewBox="0 0 100 40" 
              className="w-full h-auto"
              fill="currentColor"
            >
              <path d="M0,20 L20,5 L40,20 L60,5 L80,20 L100,5" stroke="currentColor" strokeWidth="3" fill="none" />
              <path d="M0,35 L20,20 L40,35 L60,20 L80,35 L100,20" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          </div>
        );

      case 'triangle':
        return (
          <div className={`font-bold ${sizeClass} ${colorClass}`} style={opacityStyle}>
            ▲
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`absolute pointer-events-none ${className}`}>
      {renderPattern()}
    </div>
  );
};

export default GeometricPatterns;
