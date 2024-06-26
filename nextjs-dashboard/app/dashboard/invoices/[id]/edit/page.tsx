import Form from '@/app/ui/invoices/edit-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';  // 데이터 불러오기 (고객이름 가져오기)
import { notFound } from 'next/navigation';// notFound 불러오기
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Invoices Edit',
};


// page 업뎃
export default async function Page({ params }: { params: { id: string } }) {
    const id = params.id;
    // 특정 송장 가져오기
    const [invoice, customers] = await Promise.all([
        fetchInvoiceById(id),
        fetchCustomers(),
    ]);

    if (!invoice) {
        notFound();
    }
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Invoices', href: '/dashboard/invoices' },
                    {
                        label: 'Edit Invoice',
                        href: `/dashboard/invoices/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <Form invoice={invoice} customers={customers} />
        </main>
    );
}