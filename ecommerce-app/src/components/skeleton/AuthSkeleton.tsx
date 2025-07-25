/**
 * 인증 상태 로딩 중 표시할 스켈레톤 컴포넌트
 * 
 * - 헤더의 사용자 액션 영역 스켈레톤
 * - 매우 짧은 시간만 표시됨 (보통 100ms 이하)
 * - 깜빡임 방지가 주 목적
 */
export function AuthSkeleton() {
  return (
    <div className="flex items-center gap-4">
      {/* 검색 버튼 스켈레톤 */}
      <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
      
      {/* 사용자 메뉴 스켈레톤 */}
      <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
      
      {/* 위시리스트 스켈레톤 */}
      <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
      
      {/* 장바구니 스켈레톤 */}
      <div className="w-5 h-5 bg-gray-200 animate-pulse rounded" />
    </div>
  );
}

export default AuthSkeleton;