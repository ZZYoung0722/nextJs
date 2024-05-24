import type { NextAuthConfig } from 'next-auth';

// 사용자가 로그인 하지 않으면 대시보드 페이지에 액세스 불가

// authorized 콜백은 요청이 Next.js 미들웨어를 통해 페이지에 액세스할 수 있는 권한이 있는지 확인하는 데 사용
// 요청이 완료되기 전에 호출되며 auth 및 request 속성이 있는 객체를 받는다.
// auth 속성에는 사용자의 세션이 포함되고 request 속성에는 수신 요청이 포함

// providers 옵션은 다양한 로그인 옵션을 나열하는 배열
// 현재로서는 NextAuth 구성을 충족하기 위한 빈 배열

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    // 경로 보호 로직
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                return Response.redirect(new URL('/dashboard', nextUrl));
            }
            return true;
        },
    },
    providers: [], // 일단 빈 배열로 공급자 추가
} satisfies NextAuthConfig;
