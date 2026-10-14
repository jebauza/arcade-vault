'use client';

import { useReveal } from '@/components/use-reveal';

export function HomeShell({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const ref = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="home fade-in">
      {children}
    </div>
  );
}
