/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { getSettingsAuthContext } from '@/features/settings/services/settings-auth-helper';
import { crmPreferencesSchema } from '@/features/settings/schemas/settings-schemas';

import { CRMPreferences } from '@/features/settings/types/settings-types';

let memoryCRMPreferences: CRMPreferences = {
  defaultCustomerView: 'TABLE',
  defaultLeadView: 'KANBAN',
  defaultPipelineView: 'STAGE_COLUMNS',
  defaultInvoiceCurrency: 'USD',
  defaultQuotationCurrency: 'USD',
  defaultPageSize: 25,
  numberFormat: 'STANDARD',
  dateFormat: 'YYYY-MM-DD',
};

export async function GET(request: NextRequest) {
  try {
    await getSettingsAuthContext(request);
    return NextResponse.json({ preferences: memoryCRMPreferences });
  } catch (error) {
    console.error('[API GET /api/settings/crm] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch CRM preferences.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await getSettingsAuthContext(request);
    const body = await request.json();
    const validated = crmPreferencesSchema.parse(body);

    memoryCRMPreferences = {
      ...memoryCRMPreferences,
      ...validated,
    };

    return NextResponse.json({
      preferences: memoryCRMPreferences,
      message: 'CRM preferences saved successfully.',
    });
  } catch (error: any) {
    console.error('[API PUT /api/settings/crm] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update CRM preferences.' },
      { status: 400 }
    );
  }
}
