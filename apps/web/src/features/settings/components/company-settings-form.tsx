'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SettingsService } from '../services/settings-service';
import { Building2, CheckCircle2, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';
import { useAuthStore } from '@/features/auth/stores/auth-store';

export function CompanySettingsForm() {
  const { success, error: toastError } = useToast();
  const user = useAuthStore((state) => state.user);
  const isAuthorized = user?.role === 'COMPANY_OWNER' || user?.role === 'ADMIN';

  const [name, setName] = React.useState('');
  const [legalName, setLegalName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [city, setCity] = React.useState('');
  const [country, setCountry] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState('');
  const [taxNumber, setTaxNumber] = React.useState('');
  const [defaultCurrency, setDefaultCurrency] = React.useState('USD');
  const [businessType, setBusinessType] = React.useState<'DIGITAL' | 'PHYSICAL' | 'BOTH'>('DIGITAL');
  const [timezone, setTimezone] = React.useState('UTC');

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      if (!isAuthorized) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await SettingsService.getCompanySettings();
        setName(data.name || '');
        setLegalName(data.legalName || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setCountry(data.country || '');
        setWebsite(data.website || '');
        setLogoUrl(data.logoUrl || '');
        setTaxNumber(data.taxNumber || '');
        setDefaultCurrency(data.defaultCurrency || 'USD');
        setBusinessType(data.businessType || 'DIGITAL');
        setTimezone(data.timezone || 'UTC');
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load company settings');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [isAuthorized]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      await SettingsService.updateCompanySettings({
        name,
        legalName,
        email,
        phone,
        address,
        city,
        country,
        website,
        logoUrl,
        taxNumber,
        defaultCurrency,
        businessType,
        timezone,
      });
      success('Company profile updated', 'Workspace profile and branding settings have been saved.');
      setStatusMsg('Company settings updated successfully.');
    } catch (err: any) {
      const msg = err.message || 'Failed to save company settings.';
      setErrorMsg(msg);
      toastError('Save failed', msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthorized) {
    return (
      <Card>
        <CardContent className="p-12 flex flex-col items-center justify-center text-center">
          <ShieldAlert className="h-10 w-10 text-destructive mb-3" />
          <h3 className="font-bold text-sm text-foreground">Restricted Access</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Only Company Owners and Administrators are authorized to modify organization and branding settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-semibold">Company Profile & Branding</CardTitle>
              <CardDescription className="text-xs">
                Manage organization details, tax identifiers, invoices branding, and default currency.
              </CardDescription>
            </div>
          </div>
          <Badge variant="default" className="text-[10px]">
            Admin Only
          </Badge>
        </div>
      </CardHeader>

      <form onSubmit={handleSave}>
        <CardContent className="space-y-4">
          {statusMsg && (
            <div className="flex items-center space-x-2 rounded-lg bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-lg bg-destructive/15 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Company Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Legal / Registered Name</label>
              <Input
                placeholder="AVEX Technologies Corporation"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Company Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Company Phone</label>
              <Input
                placeholder="+1 (800) 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Website</label>
              <Input
                placeholder="https://avexcrm.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Tax / EIN Number</label>
              <Input
                placeholder="US-EIN-984210492"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as any)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="DIGITAL">Digital Services & Software</option>
                <option value="PHYSICAL">Physical Goods & Manufacturing</option>
                <option value="BOTH">Hybrid (Digital & Physical)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default Currency</label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden font-mono"
              >
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="CAD">CAD ($) — Canadian Dollar</option>
                <option value="AUD">AUD ($) — Australian Dollar</option>
                <option value="AED">AED (د.إ) — UAE Dirham</option>
                <option value="PKR">PKR (₨) — Pakistani Rupee</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Logo URL</label>
              <Input
                placeholder="https://avexcrm.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">City & Country</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="San Francisco"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-9 text-xs"
                />
                <Input
                  placeholder="United States"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Physical / Billing Address</label>
            <Input
              placeholder="100 Innovation Boulevard, Suite 500"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-border pt-4">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Save Company Settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
