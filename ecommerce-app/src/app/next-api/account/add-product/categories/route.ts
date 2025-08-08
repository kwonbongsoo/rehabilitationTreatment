import { NextResponse } from 'next/server';
import categoriesService from '@/domains/category/services/categoriesService';
import { BaseError } from '@ecommerce/common';
import { HeaderBuilderFactory } from '@/lib/server/headerBuilder';

export async function GET(): Promise<NextResponse> {
  try {
    const headers = await HeaderBuilderFactory.createForApiRequest().build();

    // categoriesService를 사용하여 카테고리 조회 (서버사이드용)
    const result = await categoriesService.getCategoriesForProductForm({
      headers,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || '카테고리를 불러오는데 실패했습니다.' },
        { status: 500 },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Error fetching categories:', error);

    // @ecommerce/common 에러 처리 사용
    const errorMessage =
      error instanceof BaseError
        ? error.message
        : error instanceof Error
          ? error.message
          : '서버에 일시적인 문제가 발생했습니다.';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
