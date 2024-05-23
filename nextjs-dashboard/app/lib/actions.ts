'use server';

// 검증 라이브러리 zod
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),   // 유형의 유효성 검사 하는 동시에 number로 강제 변경하도록 설정
    status: z.enum(['pending', 'paid']),
    date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });  // 유효성 검증

// Zod를 사용하여 예상되는 유형 업데이트
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
    // 필드가 많을때
    // JavaScript Object.fromEntries()와 entries() 메소드 사용 고려
    // const rawFormData = Object.fromEntries(formData.entries()) 사용
    const {customerId, amount, status} = CreateInvoice.parse({   // 유형 검증
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];     // 날짜 생성

    // 쿼리문
    await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;

    // 데이터베이스가 업뎃되면 /dashboard/invoices 경로의 유효성이 다시 검사되고 서버에서 새로운 데이터를 가져온다.
    revalidatePath('/dashboard/invoices');  // 경로탐색
    redirect('/dashboard/invoices'); // 해당 URL로 재요청
}

// update -> create 와 유사
// formData 데이터 추출
// Zod를 사용하여 유형을 검증
// 금액을 센트로 변환, 변수를 SQL 쿼리에 전달
// revalidatePath는 클라이언트 캐시를 지우고 새 서버 요청을 하기 위해 호출
// redirect는 사용자를 청구서 페이지로 리디렉션하기 위해 호출
export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;

    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
    WHERE id = ${id}
  `;

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

// delete
export async function deleteInvoice(id: string) {
    await sql`DELETE FROM invoices WHERE id = ${id}`;
    // revalidatePath를 호출하면 새 서버 요청이 트리거되고 테이블 다시 렌더링
    // /dashboard/invoices 경로에서 호출되므로 redirect를 호출할 필요 없음
    revalidatePath('/dashboard/invoices');
}