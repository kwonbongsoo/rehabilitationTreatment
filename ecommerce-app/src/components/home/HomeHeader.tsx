'use client';

import OptimizedImageNext from '@/components/common/OptimizedImageNext';
import { FiSearch, FiSliders, FiBell, FiHeart } from 'react-icons/fi';
import styles from '@/styles/home/HomeHeader.module.css';

interface HomeHeaderProps {
  user?: {
    name: string;
    avatar?: string;
  };
  onSearchClick?: () => void;
  onFilterClick?: () => void;
  onNotificationClick?: () => void;
  onFavoriteClick?: () => void;
}

export default function HomeHeader({
  user,
  onSearchClick,
  onFilterClick,
  onNotificationClick,
  onFavoriteClick,
}: HomeHeaderProps) {
  return (
    <header className={styles.homeHeader}>
      <div className={styles.topRow}>
        <div className={styles.userProfile}>
          <div className={styles.avatar}>
            {user?.avatar ? (
              <OptimizedImageNext
                src={user.avatar}
                alt={user.name}
                width={32}
                height={32}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>{user?.name?.charAt(0) || 'U'}</div>
            )}
          </div>
          <div className={styles.greeting}>
            <span className={styles.welcomeText}>welcome,</span>
            <span className={styles.userName}>{user?.name || 'Guest'}</span>
          </div>
        </div>

        <div className={styles.actionButtons}>
          <button className={styles.actionButton} onClick={onFavoriteClick} aria-label="즐겨찾기">
            <FiHeart size={20} />
          </button>
          <button className={styles.actionButton} onClick={onNotificationClick} aria-label="알림">
            <FiBell size={20} />
          </button>
        </div>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchContainer} onClick={onSearchClick}>
          <FiSearch className={styles.searchIcon} size={16} />
          <input type="text" placeholder="Search" className={styles.searchInput} readOnly />
        </div>
        <button className={styles.filterButton} onClick={onFilterClick} aria-label="필터">
          <FiSliders size={18} />
        </button>
      </div>
    </header>
  );
}
