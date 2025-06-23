import { UIComponent } from '@/types/home';

// 컴포넌트들을 직접 import (lazy loading 제거로 로딩 상태 제거)
import Banner from './Banner';
import Brands from './Brands';
import Categories from './Categories';
import FeaturedProducts from './FeaturedProducts';
import NewArrivals from './NewArrivals';
import Promotion from './Promotion';
import Reviews from './Reviews';

// 나중에 실제 API 호출이 필요한 경우 아래 코드로 교체
// import LoadingIndicator from '@/components/common/LoadingIndicator';
// import { Suspense, lazy } from 'react';
// const Banner = lazy(() => import('./Banner'));
// const Categories = lazy(() => import('./Categories'));
// const FeaturedProducts = lazy(() => import('./FeaturedProducts'));
// const NewArrivals = lazy(() => import('./NewArrivals'));
// const Promotion = lazy(() => import('./Promotion'));
// const Reviews = lazy(() => import('./Reviews'));
// const Brands = lazy(() => import('./Brands'));

interface UIComponentRendererProps {
  component: UIComponent;
}

export default function UIComponentRenderer({ component }: UIComponentRendererProps) {
  // visible이 false면 렌더링하지 않음
  if (!component.visible) {
    return null;
  }

  // 각 컴포넌트를 직접 렌더링 (목 데이터 사용 시)
  // 실제 API 호출이 필요한 경우 각 case에 <Suspense fallback={<LoadingIndicator />}> 추가
  switch (component.type) {
    case 'banner':
      return <Banner slides={component.data.slides} />;

    case 'categories':
      return (
        <Categories
          {...(component.title && { title: component.title })}
          categories={component.data.categories}
        />
      );

    case 'featuredProducts':
      return (
        <FeaturedProducts
          title={component.title || '추천 상품'}
          products={component.data.products}
        />
      );

    case 'newArrivals':
      return <NewArrivals title={component.title || '신상품'} products={component.data.products} />;

    case 'promotion':
      return (
        <Promotion
          title={component.data.title}
          description={component.data.description}
          link={component.data.link}
          buttonText={component.data.buttonText}
        />
      );

    case 'reviews':
      return <Reviews title={component.title || '고객 후기'} reviews={component.data.reviews} />;

    case 'brands':
      return <Brands title={component.title || '제휴 브랜드'} logos={component.data.logos} />;

    default:
      console.warn(`Unknown component type: ${(component as any).type}`);
      return null;
  }
}
