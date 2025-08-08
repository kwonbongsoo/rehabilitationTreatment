'use client';

import React, { memo, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { MobileHeader } from '@/domains/home/components';

interface HomeLayoutProps {
  children: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = memo(({ children }): ReactElement => {
  const router = useRouter();

  const handleFilterClick = (): void => {
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
