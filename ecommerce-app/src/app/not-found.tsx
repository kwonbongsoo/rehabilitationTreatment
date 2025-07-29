'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m-7 16h8a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-6xl font-extrabold text-gray-900">404</h1>
          <h2 className="mt-2 text-3xl font-bold text-gray-700">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            홈으로 이동
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            이전 페이지로
          </button>
        </div>

        <div className="mt-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">대신 이런 페이지는 어떤가요?</h3>
          <div className="grid grid-cols-1 gap-2">
            <Link
              href="/categories"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              📂 전체 카테고리 보기
            </Link>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              🛍️ 상품 둘러보기
            </Link>
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              🔐 로그인하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}