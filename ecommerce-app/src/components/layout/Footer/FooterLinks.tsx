import React from 'react';
import Link from 'next/link';
import styles from '@/styles/layout/Footer/FooterLinks.module.css';

interface LinkItem {
  href: string;
  label: string;
}

interface FooterLinksProps {
  title: string;
  links: LinkItem[];
}

const FooterLinks: React.FC<FooterLinksProps> = ({ title, links }) => {
  return (
    <div className={styles.linkColumn}>
      <h4 className={styles.title}>{title}</h4>
      <div className={styles.linkList}>
        {links.map((link, index) => (
          <Link key={index} href={link.href} className={styles.link}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FooterLinks;
