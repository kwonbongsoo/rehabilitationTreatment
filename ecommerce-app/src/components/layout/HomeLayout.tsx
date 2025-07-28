'use client';

import React, { memo } from 'react';
import { useRouter } from 'next/navigation';
import { MobileHeader } from '@/domains/home/components';

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = memo(({ children }) => {
  const router = useRouter();

  const handleFilterClick = () => {
    router.push('/filter');
  };

  return (
    <>
      <MobileHeader onFilterClick={handleFilterClick} />
      {children}
    </>
  );
});

HomeLayout.displayName = 'HomeLayout';

export default HomeLayout;