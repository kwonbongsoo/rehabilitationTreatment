import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { useCurrentUser } from '../hooks/queries/useAuth';
import { ErrorMessage } from '../components/errors/ErrorMessage';
import { useErrorHandler } from '../hooks/useErrorHandler';

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
            <h1>E-Commerce App</h1>

            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <ErrorMessage
                    error={error as any}
                    variant="inline"
                    showRetry={true}
                    onRetry={() => refetch()}
                />
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