import React from 'react';
import { UIComponent } from '@/types/home';
import Banner from './Banner';
import Categories from './Categories';
import FeaturedProducts from './FeaturedProducts';
import NewArrivals from './NewArrivals';
import Promotion from './Promotion';
import Reviews from './Reviews';
import Brands from './Brands';

interface UIComponentRendererProps {
    component: UIComponent;
}

export default function UIComponentRenderer({ component }: UIComponentRendererProps) {
    // visible이 false면 렌더링하지 않음
    if (!component.visible) {
        return null;
    }

    // 각 컴포넌트 타입에 맞는 컴포넌트 렌더링
    switch (component.type) {
        case 'banner':
            return <Banner slides={component.data.slides} />;

        case 'categories':
            return <Categories
                title={component.title}
                categories={component.data.categories}
            />;

        case 'featuredProducts':
            return <FeaturedProducts
                title={component.title || '추천 상품'}
                products={component.data.products}
            />;

        case 'newArrivals':
            return <NewArrivals
                title={component.title || '신상품'}
                products={component.data.products}
            />;

        case 'promotion':
            // Promotion 컴포넌트는 data에서 title을 받는 방식으로 통일
            return <Promotion
                title={component.data.title}
                description={component.data.description}
                link={component.data.link}
                buttonText={component.data.buttonText}
            />;

        case 'reviews':
            return <Reviews
                title={component.title || '고객 후기'}
                reviews={component.data.reviews}
            />;

        case 'brands':
            return <Brands
                title={component.title || '제휴 브랜드'}
                logos={component.data.logos}
            />;

        default:
            console.warn(`Unknown component type: ${(component as any).type}`);
            return null;
    }
}