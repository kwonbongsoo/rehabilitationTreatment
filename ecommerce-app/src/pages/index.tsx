import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useCurrentUser } from '../hooks/queries/useAuth';
import { ErrorMessage } from '../components/errors/ErrorMessage';
import { useErrorHandler } from '../hooks/useErrorHandler';
import Head from 'next/head';
import Banner from '@/components/home/Banner';
import Categories from '@/components/home/Categories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import NewArrivals from '@/components/home/NewArrivals';
import Promotion from '@/components/home/Promotion';
import Reviews from '@/components/home/Reviews';
import Brands from '@/components/home/Brands';
import styles from '@/styles/common/Layout.module.css';

const MyApp: NextPage = () => {
    // 커스텀 에러 핸들러 훅 사용
    const { handleError } = useErrorHandler();

    // 사용자 정보 쿼리
    const {
        data: user,
        isLoading,
        error,
        refetch
    } = useCurrentUser();

    // 에러가 발생하면 에러 핸들러에 전달
    useEffect(() => {
        if (error) {
            handleError(error as any, 'toast');
        }
    }, [error, handleError]);

    return (
        <div className="home-page">
            <Head>
                <title>{`SHOP | 당신의 스타일을 완성하는 쇼핑몰`}</title>
                <meta name="description" content="최신 트렌드의 의류, 신발, 액세서리를 만나보세요." />
            </Head>

            <main className={styles.main}>
                <Banner />
                <Categories />
                <FeaturedProducts />
                <NewArrivals />
                <Promotion />
                <Reviews />
                <Brands />
            </main>
        </div>
    );
};

export default MyApp;