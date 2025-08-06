import CategoryIconGrid from '@/components/common/CategoryIconGrid';
import { Category } from '@/domains/category/types/categories';

interface CategoriesProps {
  title?: string;
  categories: Category[];
}

export default function Categories({ title: _title, categories }: CategoriesProps) {
  void _title;
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
