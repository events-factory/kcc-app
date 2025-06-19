import React from 'react';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`py-4 px-6 text-center text-sm text-gray-500 ${className}`}
    >
      <p>© {currentYear} KCC App. All rights reserved.</p>
    </footer>
  );
}
