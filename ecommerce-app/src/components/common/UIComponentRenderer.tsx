import { UIComponent } from './types/ui-components';
import Banner from './modules/Banner';
import Categories from './modules/Categories';
import Promotion from './modules/Promotion';
import Reviews from './modules/Reviews';
import ProductSection from './ProductSection';
import CategoryGridRenderer from '@/domains/category/components/CategoryGridRenderer';
import ProductFiltersRenderer from '@/domains/category/components/ProductFiltersRenderer';
import ProductGridRenderer from '@/domains/category/components/ProductGridRenderer';

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

    case 'categoryGrid':
      return <CategoryGridRenderer categories={component.data.categories} />;

    case 'productFilters':
      return (
        <ProductFiltersRenderer
          filterOptions={component.data.filterOptions}
          sortOptions={component.data.sortOptions}
        />
      );

    case 'productGrid':
      return <ProductGridRenderer allProducts={component.data.allProducts} />;

    default:
      console.warn(`Unknown component type: ${(component as UIComponent & { type: string }).type}`);
      return null;
  }
}
