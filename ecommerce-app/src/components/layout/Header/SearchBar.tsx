import { useState } from 'react';
import { useRouter } from 'next/router';
import { FiSearch } from 'react-icons/fi';
import styles from '@/styles/layout/Header/SearchBar.module.css';

const SearchBar: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('query')?.toString() || '';

    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <button
        className={styles.iconButton}
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        aria-label="검색"
      >
        <FiSearch size={20} />
      </button>

      <form
        className={`${styles.searchForm} ${isSearchOpen ? styles.active : ''}`}
        onSubmit={handleSearchSubmit}
      >
        <input
          type="text"
          name="query"
          placeholder="검색어를 입력하세요"
          autoComplete="off"
          autoFocus={isSearchOpen}
        />
        <button type="submit" aria-label="검색">
          <FiSearch size={18} />
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
