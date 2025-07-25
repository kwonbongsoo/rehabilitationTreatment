import { UIComponent } from '@/types/home';
import Banner from './Banner';
import Brands from './Brands';
import Categories from './Categories';
import Promotion from './Promotion';
import Reviews from './Reviews';
import ProductSection from '@/components/common/ProductSection';

interface UIComponentRendererProps {
  component: UIComponent;
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
        />
      );

    case 'newArrivals':
      return (
        <ProductSection
          title={component.title || '신상품'}
          products={component.data.products}
          viewAllLink="/products/new"
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
