'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

// 검증 라이브러리 zod
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    // Zod는 유형 string을 예상하여 고객 필드가 비어 있으면 미리 오류 발생
    // 하지만 사용자가 고객을 선택하지 않으면 친근한 메시지를 추가
    customerId: z.string({
        invalid_type_error: 'Please select a customer.', // 유효성 검사
    }),
    // 금액 유형을 string에서 number로 강제 변환하므로 문자열이 비어 있으면 기본값은 0
    // .gt() 함수를 사용하여 Zod에게 우리는 항상 0보다 큰 양을 원한다고 말함
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }), // 유효성 검사
    // Zod는 "pending" 또는 "paid"을 예상하므로 상태 필드가 비어 있으면 미리 오류 발생
    // 사용자가 상태를 선택하지 않은 경우에도 친근한 메시지를 추가
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.', // 유효성 검사
    }),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });  // 유효성 검증

// Zod를 사용하여 예상되는 유형 업데이트
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// export async function createInvoice(formData: FormData) {
//     // 필드가 많을때
//     // JavaScript Object.fromEntries()와 entries() 메소드 사용 고려
//     // const rawFormData = Object.fromEntries(formData.entries()) 사용
//     const {customerId, amount, status} = CreateInvoice.parse({   // 유형 검증
//         customerId: formData.get('customerId'),
//         amount: formData.get('amount'),
//         status: formData.get('status'),
//     });
//     const amountInCents = amount * 100;
//     const date = new Date().toISOString().split('T')[0];     // 날짜 생성
//
//     // 쿼리문
//     await sql`
//     INSERT INTO invoices (customer_id, amount, status, date)
//     VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
//   `;
//
//     // 데이터베이스가 업뎃되면 /dashboard/invoices 경로의 유효성이 다시 검사되고 서버에서 새로운 데이터를 가져온다.
//     revalidatePath('/dashboard/invoices');  // 경로탐색
//     redirect('/dashboard/invoices'); // 해당 URL로 재요청
// }


// 이는 @types/react-dom이 업데이트될 때까지 일시적입니다
export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

// prevState : useFormState 후크에서 전달된 상태를 포함
// 이 작업에서는 이를 사용하지 않지만 필수 prop
// Zod를 사용하여 양식 필드 검증
// safeParse() : success 또는 error 필드를 포함하는 객체를 반환
// 이렇게 하면 이 로직을 try/catch 블록 안에 넣지 않고도 유효성 검사를 보다 원활하게 처리하는 데 도움
export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // 양식 유효성 검사에 실패하면 오류를 조기에 반환하고, 그렇지 않으면 계속하십시오.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    // 데이터베이스에 삽입할 데이터 준비
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // 데이터베이스에 데이터 삽입
    try {
        await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
    } catch (error) {
        // 데이터베이스 오류가 발생하면 보다 구체적인 오류를 반환합니다.
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    // 송장 페이지의 캐시를 다시 확인하고 사용자를 리디렉션합니다.
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

// update -> create 와 유사
// formData 데이터 추출
// Zod를 사용하여 유형을 검증
// 금액을 센트로 변환, 변수를 SQL 쿼리에 전달
// revalidatePath는 클라이언트 캐시를 지우고 새 서버 요청을 하기 위해 호출
// redirect는 사용자를 청구서 페이지로 리디렉션하기 위해 호출
// export async function updateInvoice(id: string, formData: FormData) {
//     const { customerId, amount, status } = UpdateInvoice.parse({
//         customerId: formData.get('customerId'),
//         amount: formData.get('amount'),
//         status: formData.get('status'),
//     });
//
//     const amountInCents = amount * 100;
//
//     await sql`
//     UPDATE invoices
//     SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
//     WHERE id = ${id}
//   `;
//
//     revalidatePath('/dashboard/invoices');
//     redirect('/dashboard/invoices');
// }


export async function updateInvoice(
    id: string,
    prevState: State,
    formData: FormData,
) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
        UPDATE invoices
        SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
        WHERE id = ${id}
      `;
    } catch (error) {
        return { message: 'Database Error: Failed to Update Invoice.' };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


// delete

// export async function deleteInvoice(id: string) {
//     await sql`DELETE FROM invoices WHERE id = ${id}`;
//     // revalidatePath를 호출하면 새 서버 요청이 트리거되고 테이블 다시 렌더링
//     // /dashboard/invoices 경로에서 호출되므로 redirect를 호출할 필요 없음
//     revalidatePath('/dashboard/invoices');
// }

export async function deleteInvoice(id: string) {
    throw new Error('Failed to Delete Invoice');

    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice.' };
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Invoice.' };
    }
}


// 인증로직과 로그인 양식 연결
// auth.ts 에서 signIn 함수 가져오기
export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}