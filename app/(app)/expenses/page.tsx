'use client';

import ExpensesView from '@/features/expenses';
import { PageTransition } from '@/components/layout/PageTransition';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { useRent } from '@/store/rent-store';
import { useProperties } from '@/features/properties/properties.queries';

export default function ExpensesPage() {
  const { lang } = useRent();
  const { data: properties = [], isLoading } = useProperties();
  if (isLoading) {
    return (
      <PageTransition>
        <PageSkeleton />
      </PageTransition>
    );
  }
  return (
    <PageTransition>
      <ExpensesView properties={properties} lang={lang} />
    </PageTransition>
  );
}
