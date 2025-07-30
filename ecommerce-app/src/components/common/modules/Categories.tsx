import CategoryIconGrid from '@/components/common/CategoryIconGrid';
import { CategoryI } from '@/domains/category/types/categories';

interface CategoriesProps {
  title?: string;
  categories: CategoryI[];
}

export default function Categories({ title: _title, categories }: CategoriesProps) {
  return (
    <CategoryIconGrid
      categories={categories}
      showHeader={true}
      headerTitle="Category"
      seeAllLink="/categories"
      seeAllText="see all"
    />
  );
}
