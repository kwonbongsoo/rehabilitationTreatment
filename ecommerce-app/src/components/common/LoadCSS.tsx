// 나중에 필요할 때 사용할 수 있는 CSS 비동기 로드 컴포넌트
'use client';

import { useEffect } from 'react';

interface LoadCSSProps {
  href: string;
  id?: string;
}

export default function LoadCSS({ href, id }: LoadCSSProps) {
  useEffect(() => {
    // 이미 로드된 CSS인지 확인
    const existingLink = document.querySelector(`link[href="${href}"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    if (id) link.id = id;
    
    // 로딩 에러 처리
    link.onerror = () => {
      console.warn(`Failed to load CSS: ${href}`);
    };
    
    document.head.appendChild(link);

    return () => {
      // 컴포넌트 언마운트 시 CSS 제거
      const linkToRemove = document.querySelector(`link[href="${href}"]`);
      if (linkToRemove && linkToRemove.parentNode) {
        linkToRemove.parentNode.removeChild(linkToRemove);
      }
    };
  }, [href, id]);

  return null;
}

// 여러 CSS 파일을 로드하는 컴포넌트
interface LoadMultipleCSSProps {
  stylesheets: Array<{
    href: string;
    id?: string;
    priority?: 'high' | 'low';
  }>;
}

export function LoadMultipleCSS({ stylesheets }: LoadMultipleCSSProps) {
  useEffect(() => {
    stylesheets.forEach(({ href, id, priority = 'low' }) => {
      // 이미 로드된 CSS인지 확인
      const existingLink = document.querySelector(`link[href="${href}"]`);
      if (existingLink) return;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      if (id) link.id = id;
      
      // 우선순위 설정
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      
      // 로딩 에러 처리
      link.onerror = () => {
        console.warn(`Failed to load CSS: ${href}`);
      };
      
      document.head.appendChild(link);
    });

    return () => {
      // 컴포넌트 언마운트 시 모든 CSS 제거
      stylesheets.forEach(({ href }) => {
        const linkToRemove = document.querySelector(`link[href="${href}"]`);
        if (linkToRemove && linkToRemove.parentNode) {
          linkToRemove.parentNode.removeChild(linkToRemove);
        }
      });
    };
  }, [stylesheets]);

  return null;
}