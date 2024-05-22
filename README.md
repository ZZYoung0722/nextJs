# nextJs

# Learn Next.js

## 실행방법
npm run dev

## Tailwind
새 프젝 시작 시 Next.js Tailwind 사용할 건지 물어봄 그때 yes 하면 자동으로 필요한 패키지 설치 및 애플리케이션에 Tailwind 구성

## css 모듈
각 구성요소에 대해 고유한 클래스 이름을 생성하므로 스타일 충돌에 대해 걱정할 필요 없다

## clsx
클래스 이름을 쉽게 전환할 수 있는 라이브러리

## 글꼴
Next.js는 빌드 시 글꼴 파일을 다운로드하고 이를 다른 정적 자산과 함께 호스팅한다. 

사용자가 애플리케이션을 방문할 때 성능에 영향을 미칠 수 있는 글꼴에 대한 추가 네트워크 요청이 없음을 의미

## 루트 레이아웃
루트 레이아웃에 추가하는 모든 UI는 애플리케이션의 모든 페이지에서 공유 됨

루트 레이아웃을 사용하여 <html> 및 <boby> 태그를 수정하고 메타데이터를 추가 가능

고유한 레이아웃은 루트 레이아웃에 UI 추가할 이유 없음

## Next.js에서 레이아웃 파일
레이아웃파일의 목적은 애플리케이션의 모든 페이지에서 사용할 수 있는 공유 레이아웃을 만드는 가장 좋은 방법

## <Link> Link 태그
브라우저의 뷰포트에 나타날 때마다 Next.js는 백그라운드에서 연결된 경로에 대한 코드를 자동으로 미리 가져옴

사용자가 링크를 클릭하면 대상 페이지의 코드가 이미 백그라운드에 로드되어 페이지 전환이 거의 즉각적으로 이루어짐

## usePathname
현재 URL의 경로 이름을 읽을 수 있는 클라이언트 구성 요소 후크 및 현재의 URL의 경로 이름 문자열을 반환

'use client'
 
import { usePathname } from 'next/navigation'
 
export default function ExampleClientComponent() {
  const pathname = usePathname()
  return <p>Current pathname: {pathname}</p>
}


