/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { VendorModal } from '@/features/expenses/components/vendor-modal';
import { Vendor } from '@/features/expenses/types/expense-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Loader2, Building2, Mail, Phone, MapPin } from 'lucide-react';

export default function VendorsDirectoryPage() {
  const [vendors, setVendors] = React.useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const fetchVendors = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/expenses/vendors');
      if (res.ok) {
        const data = await res.json();
        setVendors(data.vendors || []);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  return (
    <ContentContainer>
      <PageHeader
        title="Vendor Directory"
        description="Manage company suppliers, software subscriptions, equipment vendors, and service provider profiles."
        breadcrumbs={[{ label: 'Finance', href: '/finance?tab=expenses' }, { label: 'Vendor Directory' }]}
        actions={
          <div className="flex items-center space-x-2">
            <Link href="/finance?tab=expenses">
              <Button variant="outline" size="sm" className="h-9 px-3 text-xs gap-1.5 font-semibold">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Expenses</span>
              </Button>
            </Link>

            <Button
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="h-9 px-3.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              <span>Add Vendor</span>
            </Button>
          </div>
        }
      />

      <div className="mt-4 space-y-6 text-xs">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-xs">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
            Loading vendor directory...
          </div>
        ) : vendors.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs space-y-3">
            <div>No vendors created yet.</div>
            <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>
              Add your first vendor
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((v) => (
              <Card key={v.id} className="shadow-2xs border-border flex flex-col justify-between">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base font-bold flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate">{v.name}</span>
                  </CardTitle>
                  {v.contactPerson && (
                    <CardDescription className="text-xs">Contact: {v.contactPerson}</CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-4 py-2 space-y-1.5 text-xs text-muted-foreground">
                  {v.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate text-foreground font-mono">{v.email}</span>
                    </div>
                  )}

                  {v.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="text-foreground">{v.phone}</span>
                    </div>
                  )}

                  {v.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="text-foreground truncate">{v.address}</span>
                    </div>
                  )}

                  {v.notes && (
                    <p className="text-[11px] bg-muted/30 p-2 rounded-md border border-border/40 mt-2 text-foreground">
                      {v.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <VendorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaved={fetchVendors}
        />
      )}
    </ContentContainer>
  );
}
