import styles from '@/styles/layout/Header/SearchBar.module.css';
import { useRouter } from 'next/navigation';
import React, { memo, useCallback, useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar: React.FC = memo(() => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  // ✅ 표준 useRouter 방식 (베스트 프랙티스)
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const query = formData.get('query')?.toString() || '';

      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsSearchOpen(false);
      }
    },
    [router],
  );

  // ✅ 수정: dependency 제거하고 함수형 업데이트 사용
  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  // 검색창 닫기 핸들러를 useCallback으로 메모이제이션
  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
  }, []);

  // ✅ 수정: isSearchOpen dependency 제거, 직접 state 확인
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsSearchOpen((prev) => {
        if (prev) {
          // 검색창이 열려있을 때만 닫기
          return false;
        }
        return prev;
      });
    }
  }, []);

  return (
    <div className={styles.searchContainer}>
      <button className={styles.iconButton} onClick={toggleSearch} aria-label="검색">
        <FiSearch size={20} />
      </button>

      <form
        className={`${styles.searchForm} ${isSearchOpen ? styles.active : ''}`}
        onSubmit={handleSearchSubmit}
        onKeyDown={handleKeyDown}
      >
        <input
          type="text"
          name="query"
          placeholder="검색어를 입력하세요 (ESC로 닫기)"
          autoComplete="off"
          autoFocus={isSearchOpen}
        />
        <button type="submit" aria-label="검색">
          <FiSearch size={18} />
        </button>
        {/* 검색창 닫기 버튼 */}
        <button
          type="button"
          className={styles.closeButton}
          onClick={closeSearch}
          aria-label="검색창 닫기"
        >
          <FiX size={18} />
        </button>
      </form>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
