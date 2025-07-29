import { CategoriesClient } from '@/domains/category/components';
import { getCategoriesAction } from '@/domains/category/services';

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

  const { categories, allProducts, filters, sortOptions } = data.data!;

  return (
    <CategoriesClient
      categories={categories}
      allProducts={allProducts}
      filterOptions={filters}
      sortOptions={sortOptions}
      initialCategoryFilter={searchParams.category || '0'}
    />
  );
}
