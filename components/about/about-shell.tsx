'use client';

import { useReveal } from '@/components/use-reveal';

export function AboutShell({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="about fade-in">
      {children}
    </div>
  );
}
