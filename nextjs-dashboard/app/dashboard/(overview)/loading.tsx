// 1. loading.tsxSuspense를 기반으로 구축된 특별한 Next.js 파일로, 페이지 콘텐츠가 로드되는 동안 대체 UI로 표시할 폴백 UI를 생성
// 2. 정적 이므로 <SideNav>즉시 표시됩니다. 사용자는 <SideNav>동적 콘텐츠가 로드되는 동안 상호 작용 가능
// 3. 사용자는 다른 페이지로 이동하기 전에 페이지 로드가 완료될 때까지 기다릴 필요가 없다(이를 중단 가능한 탐색이라고 함).

import DashboardSkeleton from '@/app/ui/skeletons';
export default function Loading() {
    // return <div>Loading...</div>;

    // loading.tsx 포함하는 모든 UI는 정적 파일의 일부로 포함되어 먼저 전송 그런 다음 나머지 동적 콘텐츠가 서버에서 클라이언트로 스트리밍
    return <DashboardSkeleton />;
}