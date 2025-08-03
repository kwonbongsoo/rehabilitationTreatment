import UIComponentRenderer from '@/components/common/UIComponentRenderer';
import { CategoryProvider } from '@/domains/category/context/CategoryContext';
import { categoriesService } from '@/domains/category/services';
import { UIComponent } from '@/components/common/types/ui-components';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';

// 쿠키 사용으로 인해 동적 렌더링 강제
export const dynamic = 'force-dynamic';

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const headers = await HeaderBuilderFactory.createForApiRequest().build();
  const { components } = await categoriesService.getCategoriesPageData({ headers });

  return (
    <CategoryProvider initialCategoryFilter={searchParams.category || '0'}>
      <div>
        {components.map((component: UIComponent, index: number) => (
          <UIComponentRenderer key={component.id} component={component} index={index} />
        ))}
      </div>
    </CategoryProvider>
  );
}
