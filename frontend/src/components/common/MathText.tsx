import React from 'react';

export function formatMath(text: string): string {
  if (!text) return '';
  return text
    .replace(/\\neq/g, '≠')
    .replace(/\\Rightarrow/g, ' ➔ ')
    .replace(/\\rightarrow/g, ' ➔ ')
    .replace(/\\ge/g, '≥')
    .replace(/\\le/g, '≤')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\sqrt\{?(.*?)\}?/g, '√($1)')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\$\$?(.*?)\$\$?/g, '$1');
}

export const MathText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  return <span className={className}>{formatMath(text)}</span>;
};
