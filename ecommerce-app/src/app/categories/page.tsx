import { CategoriesClient } from '@/domains/category/components';
import { getCategoriesAction } from '@/domains/category/services';

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
