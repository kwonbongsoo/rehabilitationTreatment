import { UIComponent } from './types/ui-components';
import Banner from './modules/Banner';
import Brands from './modules/Brands';
import Categories from './modules/Categories';
import Promotion from './modules/Promotion';
import Reviews from './modules/Reviews';
import ProductSection from './ProductSection';

interface UIComponentRendererProps {
  component: UIComponent;
  index?: number;
}

export default function UIComponentRenderer({ component }: UIComponentRendererProps) {
  if (!component.visible) {
    return null;
  }

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
        <ProductSection
          title={component.title || '추천 상품'}
          products={component.data.products}
          viewAllLink="/products/featured"
          eagerCount={2} // 처음 2개만 eager 로딩
          allLazy={false}
        />
      );

    case 'newArrivals':
      return (
        <ProductSection
          title={component.title || '신상품'}
          products={component.data.products}
          viewAllLink="/products/new"
          allLazy={true} // 신상품은 모두 lazy 로딩
        />
      );

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