import { redirect } from 'next/navigation';

export default function TaxesPage() {
  redirect('/finance?tab=taxes');
}
