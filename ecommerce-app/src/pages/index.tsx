import React, { useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { userRepository } from '../api/repository';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { ErrorMessage } from '../components/errors/ErrorMessage';
import Header from '../components/Header';

const Home: React.FC = () => {
    const { data: user, loading, error, execute } = useApi(userRepository.getCurrentUser);
    const { handleError } = useErrorHandler();

    useEffect(() => {
        // 사용자 정보 로드
        execute().catch(err => {
            // 토스트 에러로 처리
            handleError(err, 'toast');
        });
    }, [execute, handleError]);

    return (
        <div>
            <Header />
            <main>
                <h1>Welcome to Our E-Commerce Store</h1>

                {loading ? (
                    <div className="loading">사용자 정보를 불러오는 중...</div>
                ) : error ? (
                    <ErrorMessage
                        error={error}
                        variant="inline"
                        showRetry={true}
                        onRetry={() => execute()}
                    />
                ) : user ? (
                    <div className="user-greeting">
                        안녕하세요, {user.firstName}님! 다시 방문해주셔서 감사합니다.
                    </div>
                ) : null}

                <section>
                    <h2>Featured Products</h2>
                </section>
            </main>
        </div>
    );
};

export default Home;