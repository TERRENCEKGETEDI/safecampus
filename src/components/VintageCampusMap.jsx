import React from 'react';

const VintageCampusMap = () => {
  return (
    <div style={{
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f5f2e8',
      border: '2px solid #8b7355',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        fontFamily: 'serif',
        color: '#5d4e37'
      }}>
        <h1 style={{
          fontSize: '2.5em',
          margin: '0',
          textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
          letterSpacing: '2px'
        }}>
          Universitas Antiquus
        </h1>
        <p style={{
          fontSize: '1.2em',
          margin: '10px 0',
          fontStyle: 'italic',
          opacity: 0.8
        }}>
          Campus Illustratio • Anno Domini MDCCCL
        </p>
      </div>

      <svg
        width="100%"
        height="600"
        viewBox="0 0 1000 600"
        style={{
          filter: 'sepia(0.3) contrast(1.1) brightness(0.95)',
          border: '1px solid #8b7355',
          backgroundColor: '#fefcf7'
        }}
      >
        {/* Ornate border */}
        <defs>
          <pattern id="parchment" patternUnits="userSpaceOnUse" width="50" height="50">
            <rect width="50" height="50" fill="#fefcf7"/>
            <circle cx="25" cy="25" r="1" fill="#d4c4a8" opacity="0.3"/>
            <circle cx="10" cy="40" r="0.5" fill="#d4c4a8" opacity="0.2"/>
            <circle cx="40" cy="10" r="0.5" fill="#d4c4a8" opacity="0.2"/>
          </pattern>

          <filter id="vintage-shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#8b7355" floodOpacity="0.3"/>
          </filter>

          <filter id="ivy-texture">
            <feTurbulence baseFrequency="0.1" numOctaves="3" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2"/>
          </filter>
        </defs>

        {/* Background parchment texture */}
        <rect width="1000" height="600" fill="url(#parchment)"/>

        {/* Decorative border */}
        <path d="M20,20 L980,20 L980,580 L20,580 Z"
              fill="none"
              stroke="#8b7355"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"/>
        <path d="M10,10 L990,10 L990,590 L10,590 Z"
              fill="none"
              stroke="#d4c4a8"
              strokeWidth="1"
              opacity="0.5"/>

        {/* Corner decorations */}
        <circle cx="20" cy="20" r="8" fill="#8b7355" opacity="0.7"/>
        <circle cx="980" cy="20" r="8" fill="#8b7355" opacity="0.7"/>
        <circle cx="20" cy="580" r="8" fill="#8b7355" opacity="0.7"/>
        <circle cx="980" cy="580" r="8" fill="#8b7355" opacity="0.7"/>

        {/* Central Historic Building - Gothic Architecture */}
        <g transform="translate(350, 200)">
          {/* Main building structure */}
          <rect x="0" y="50" width="300" height="200" fill="#8b7355" stroke="#654321" strokeWidth="2" filter="url(#vintage-shadow)"/>

          {/* Gothic arches at base */}
          <path d="M0,250 Q50,200 100,250 Q150,200 200,250 Q250,200 300,250 L300,270 L0,270 Z"
                fill="#a0865c" stroke="#654321" strokeWidth="1"/>

          {/* Clock tower */}
          <rect x="120" y="0" width="60" height="80" fill="#8b7355" stroke="#654321" strokeWidth="2"/>
          <circle cx="150" cy="30" r="15" fill="#2c2c2c" stroke="#654321" strokeWidth="1"/>
          <line x1="150" y1="20" x2="150" y2="40" stroke="#d4c4a8" strokeWidth="2"/>
          <line x1="140" y1="30" x2="160" y2="30" stroke="#d4c4a8" strokeWidth="2"/>
          <polygon points="145,25 150,15 155,25" fill="#d4c4a8"/>

          {/* Tower spire */}
          <polygon points="135,0 165,0 150,30" fill="#654321"/>
          <circle cx="150" cy="10" r="3" fill="#d4c4a8"/>

          {/* Arched windows */}
          <ellipse cx="50" cy="120" rx="20" ry="30" fill="#2c2c2c" stroke="#654321" strokeWidth="1"/>
          <ellipse cx="50" cy="120" rx="15" ry="25" fill="#fefcf7" opacity="0.3"/>
          <ellipse cx="250" cy="120" rx="20" ry="30" fill="#2c2c2c" stroke="#654321" strokeWidth="1"/>
          <ellipse cx="250" cy="120" rx="15" ry="25" fill="#fefcf7" opacity="0.3"/>
          <ellipse cx="150" cy="120" rx="20" ry="30" fill="#2c2c2c" stroke="#654321" strokeWidth="1"/>
          <ellipse cx="150" cy="120" rx="15" ry="25" fill="#fefcf7" opacity="0.3"/>

          {/* Upper windows */}
          <rect x="40" y="80" width="15" height="25" fill="#2c2c2c" stroke="#654321" strokeWidth="1"/>
          <rect x="40" y="80" width="10" height="20" fill="#fefcf7" opacity="0.3"/>
          <rect x="245" y="80" width="15" height="25" fill="#2c2c2c" stroke="#654321" strokeWidth="1"/>
          <rect x="245" y="80" width="10" height="20" fill="#fefcf7" opacity="0.3"/>
          <rect x="140" y="80" width="15" height="25" fill="#2c2c2c" stroke="#654321" strokeWidth="1"/>
          <rect x="140" y="80" width="10" height="20" fill="#fefcf7" opacity="0.3"/>

          {/* Ivy-covered walls */}
          <g filter="url(#ivy-texture)" opacity="0.6">
            <path d="M0,50 Q20,40 40,50 Q60,45 80,50 Q100,48 120,50 Q140,52 160,50 Q180,48 200,50 Q220,52 240,50 Q260,48 280,50 Q290,52 300,50 L300,250 L0,250 Z"
                  fill="#2d5a27" opacity="0.4"/>
            <circle cx="50" cy="80" r="3" fill="#2d5a27"/>
            <circle cx="120" cy="90" r="4" fill="#2d5a27"/>
            <circle cx="200" cy="85" r="3" fill="#2d5a27"/>
            <circle cx="270" cy="95" r="4" fill="#2d5a27"/>
          </g>

          {/* Main entrance */}
          <rect x="130" y="220" width="40" height="50" fill="#2c2c2c" stroke="#654321" strokeWidth="1"/>
          <path d="M130,235 Q150,215 170,235" fill="none" stroke="#d4c4a8" strokeWidth="3"/>
        </g>

        {/* Cobblestone paths */}
        <g opacity="0.8">
          {/* Main central path */}
          <path d="M200,400 Q500,350 800,400"
                fill="none"
                stroke="#696969"
                strokeWidth="20"
                strokeLinecap="round"/>
          <path d="M200,400 Q500,350 800,400"
                fill="none"
                stroke="#a9a9a9"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="2,3"/>

          {/* Side paths */}
          <path d="M300,450 Q500,420 700,450"
                fill="none"
                stroke="#696969"
                strokeWidth="12"
                strokeLinecap="round"/>
          <path d="M300,450 Q500,420 700,450"
                fill="none"
                stroke="#a9a9a9"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="1,2"/>
        </g>

        {/* Ancient oak trees */}
        <g>
          {/* Tree 1 - Left */}
          <circle cx="150" cy="320" r="25" fill="#654321"/>
          <circle cx="140" cy="290" r="35" fill="#2d5a27"/>
          <circle cx="160" cy="285" r="30" fill="#2d5a27"/>
          <circle cx="135" cy="305" r="28" fill="#2d5a27"/>
          <circle cx="165" cy="300" r="32" fill="#2d5a27"/>

          {/* Tree 2 - Right */}
          <circle cx="850" cy="320" r="25" fill="#654321"/>
          <circle cx="840" cy="290" r="35" fill="#2d5a27"/>
          <circle cx="860" cy="285" r="30" fill="#2d5a27"/>
          <circle cx="835" cy="305" r="28" fill="#2d5a27"/>
          <circle cx="865" cy="300" r="32" fill="#2d5a27"/>

          {/* Tree 3 - Center left */}
          <circle cx="250" cy="380" r="20" fill="#654321"/>
          <circle cx="240" cy="355" r="28" fill="#2d5a27"/>
          <circle cx="260" cy="350" r="25" fill="#2d5a27"/>
          <circle cx="235" cy="365" r="22" fill="#2d5a27"/>

          {/* Tree 4 - Center right */}
          <circle cx="750" cy="380" r="20" fill="#654321"/>
          <circle cx="740" cy="355" r="28" fill="#2d5a27"/>
          <circle cx="760" cy="350" r="25" fill="#2d5a27"/>
          <circle cx="735" cy="365" r="22" fill="#2d5a27"/>
        </g>

        {/* Manicured lawns */}
        <g opacity="0.7">
          <ellipse cx="500" cy="450" rx="200" ry="80" fill="#90EE90" stroke="#228B22" strokeWidth="1"/>
          <ellipse cx="300" cy="480" rx="120" ry="50" fill="#90EE90" stroke="#228B22" strokeWidth="1"/>
          <ellipse cx="700" cy="480" rx="120" ry="50" fill="#90EE90" stroke="#228B22" strokeWidth="1"/>
        </g>

        {/* Scattered benches */}
        <g opacity="0.9">
          {/* Bench 1 */}
          <rect x="180" y="430" width="40" height="8" fill="#8b4513" stroke="#654321" strokeWidth="1"/>
          <rect x="185" y="425" width="6" height="15" fill="#8b4513" stroke="#654321" strokeWidth="1"/>
          <rect x="209" y="425" width="6" height="15" fill="#8b4513" stroke="#654321" strokeWidth="1"/>
          <rect x="215" y="425" width="6" height="15" fill="#8b4513" stroke="#654321" strokeWidth="1"/>

          {/* Bench 2 */}
          <rect x="780" y="430" width="40" height="8" fill="#8b4513" stroke="#654321" strokeWidth="1"/>
          <rect x="785" y="425" width="6" height="15" fill="#8b4513" stroke="#654321" strokeWidth="1"/>
          <rect x="809" y="425" width="6" height="15" fill="#8b4513" stroke="#654321" strokeWidth="1"/>
          <rect x="815" y="425" width="6" height="15" fill="#8b4513" stroke="#654321" strokeWidth="1"/>

          {/* Bench 3 */}
          <rect x="450" y="500" width="40" height="8" fill="#8b4513" stroke="#654321" strokeWidth="1"/>
          <rect x="455" y="495" width="6" height="15" fill="#8b4513" stroke="#654321" strokeWidth="1"/>
          <rect x="479" y="495" width="6" height="15" fill="#8b4513" stroke="#654321" strokeWidth="1"/>
          <rect x="485" y="495" width="6" height="15" fill="#8b4513" stroke="#654321" strokeWidth="1"/>
        </g>

        {/* Subtle annotations */}
        <g fontFamily="serif" fontSize="12" fill="#654321" opacity="0.7">
          <text x="500" y="520" textAnchor="middle" fontStyle="italic">Universitatis Atrium</text>
          <text x="200" y="470" textAnchor="middle" fontStyle="italic">Hortus Orientalis</text>
          <text x="800" y="470" textAnchor="middle" fontStyle="italic">Hortus Occidentalis</text>
          <text x="500" y="350" textAnchor="middle" fontStyle="italic">Via Principalis</text>
          <text x="150" y="280" textAnchor="middle" fontStyle="italic">Quercus Antiquus</text>
          <text x="850" y="280" textAnchor="middle" fontStyle="italic">Quercus Antiquus</text>
        </g>

        {/* Decorative compass rose */}
        <g transform="translate(50, 50)">
          <circle cx="0" cy="0" r="25" fill="none" stroke="#8b7355" strokeWidth="2"/>
          <line x1="0" y1="-20" x2="0" y2="20" stroke="#8b7355" strokeWidth="1"/>
          <line x1="-20" y1="0" x2="20" y2="0" stroke="#8b7355" strokeWidth="1"/>
          <text x="0" y="-15" textAnchor="middle" fontSize="10" fill="#8b7355" fontFamily="serif">N</text>
          <text x="15" y="5" textAnchor="middle" fontSize="10" fill="#8b7355" fontFamily="serif">E</text>
          <text x="0" y="25" textAnchor="middle" fontSize="10" fill="#8b7355" fontFamily="serif">S</text>
          <text x="-15" y="5" textAnchor="middle" fontSize="10" fill="#8b7355" fontFamily="serif">W</text>
        </g>

        {/* Scale indicator */}
        <g transform="translate(800, 520)">
          <line x1="0" y1="0" x2="100" y2="0" stroke="#8b7355" strokeWidth="2"/>
          <line x1="0" y1="-5" x2="0" y2="5" stroke="#8b7355" strokeWidth="1"/>
          <line x1="100" y1="-5" x2="100" y2="5" stroke="#8b7355" strokeWidth="1"/>
          <text x="50" y="15" textAnchor="middle" fontSize="10" fill="#8b7355" fontFamily="serif">100 Pedes</text>
        </g>

        {/* Faded vignette effect */}
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="transparent"/>
            <stop offset="70%" stopColor="transparent"/>
            <stop offset="100%" stopColor="#fefcf7" stopOpacity="0.8"/>
          </radialGradient>
        </defs>
        <rect width="1000" height="600" fill="url(#vignette)"/>
      </svg>

      <div style={{
        textAlign: 'center',
        marginTop: '20px',
        fontFamily: 'serif',
        fontSize: '0.9em',
        color: '#8b7355',
        opacity: 0.8
      }}>
        <p><em>"In hoc loco, sapientia et traditio conveniunt"</em></p>
        <p><small>"In this place, wisdom and tradition come together"</small></p>
      </div>
    </div>
  );
};

export default VintageCampusMap;