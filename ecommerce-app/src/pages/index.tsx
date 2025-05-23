import React from 'react';
import Header from '../components/Header';

const Home: React.FC = () => {
    return (
        <div>
            <Header />
            <main>
                <h1>Welcome to Our E-Commerce Store</h1>
                <section>
                    <h2>Featured Products</h2>
                    {/* Add product cards or categories here */}
                </section>
            </main>
        </div>
    );
};

export default Home;