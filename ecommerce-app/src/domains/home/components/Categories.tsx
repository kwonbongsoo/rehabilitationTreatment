import CategoryIconGrid from '@/components/common/CategoryIconGrid';

interface CategoriesProps {
  title?: string; // 선택적 prop으로 정의
  categories: {
    id: number;
    name: string;
    icon: string;
    link: string;
  }[];
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
