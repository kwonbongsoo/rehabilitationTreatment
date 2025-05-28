import React from 'react';
import { NextPage } from 'next';
import { useCurrentUser } from '../hooks/queries/useAuth';

const MyApp: NextPage = () => {
    // 커스텀 훅 사용
    const { data: user, isLoading, error } = useCurrentUser();

    if (error) {
        return (
            <div className="error-container">
                <p>문제가 발생했습니다. 다시 시도해주세요.</p>
            </div>
        );
    }

    return (
        <div className="home-page">
            <h1>E-Commerce App</h1>

            {isLoading ? (
                <p>Loading...</p>
            ) : user ? (
                <p>Welcome back, {user.firstName}!</p>
            ) : (
                <p>Welcome! Please log in to see personalized content.</p>
            )}

            {/* 홈페이지 콘텐츠 */}
        </div>
    );
};

export default MyApp;