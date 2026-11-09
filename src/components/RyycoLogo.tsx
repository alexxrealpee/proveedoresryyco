/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface RyycoLogoProps {
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
  showSubtitle?: boolean;
}

export const RyycoLogo: React.FC<RyycoLogoProps> = ({
  variant = 'dark',
  className = 'h-9',
  showSubtitle = true,
}) => {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="relative flex items-center">
        {/* Usamos el SVG vectorial oficial de RYYCO con chef rojo sonriente y tipografía corporativa */}
        <img
          src={variant === 'light' ? '/logo.svg' : '/logo-dark.svg'}
          alt="RYYCO"
          className={`${className} w-auto object-contain`}
        />
      </div>

      {showSubtitle && (
        <div className="flex flex-col justify-center leading-none pl-1 border-l border-slate-300 dark:border-slate-700">
          <span
            className={`text-xs font-bold font-display uppercase tracking-wider ${
              variant === 'light' ? 'text-amber-400' : 'text-amber-600'
            }`}
          >
            Proveedores
          </span>
          <span
            className={`text-[10px] font-medium tracking-tight ${
              variant === 'light' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Red Mayorista
          </span>
        </div>
      )}
    </div>
  );
};
