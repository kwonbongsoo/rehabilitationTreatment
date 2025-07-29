import UIComponentRenderer from '@/components/common/UIComponentRenderer';
import { CategoryProvider } from '@/domains/category/context/CategoryContext';
import { getCategoriesAction } from '@/domains/category/services';
import { UIComponent } from '@/components/common/types/ui-components';

// 쿠키 사용으로 인해 동적 렌더링 강제
export const dynamic = 'force-dynamic';

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const data = await getCategoriesAction();

  if (!data.success) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>{data.error || 'Failed to load data'}</p>
      </div>
    );
  }

  const { components } = data.data!;

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
