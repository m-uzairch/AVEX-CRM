import {
  ImportJob,
  ExecuteImportPayload,
} from '../types/import-types';

export const availableCrmFields = [
  { key: 'name', label: 'Lead Name', required: true },
  { key: 'companyName', label: 'Company Name', required: true },
  { key: 'email', label: 'Email Address', required: true },
  { key: 'phone', label: 'Phone Number', required: true },
  { key: 'source', label: 'Lead Source', required: false },
  { key: 'industry', label: 'Industry', required: false },
  { key: 'country', label: 'Country', required: false },
  { key: 'city', label: 'City', required: false },
  { key: 'address', label: 'Address', required: false },
  { key: 'postalCode', label: 'Postal Code', required: false },
  { key: 'website', label: 'Website URL', required: false },
  { key: 'expectedDealValue', label: 'Expected Deal Value ($)', required: false },
];

export async function uploadImportFile(file: File): Promise<ImportJob> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/crm/leads/import/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to upload and parse file');
  }

  const data = await res.json();
  return data.job;
}

export async function fetchImportJobs(): Promise<ImportJob[]> {
  const res = await fetch('/api/crm/leads/import/jobs');
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch import history');
  }
  const data = await res.json();
  return data.jobs || [];
}

export async function fetchImportJobById(jobId: string): Promise<ImportJob> {
  const res = await fetch(`/api/crm/leads/import/jobs/${jobId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch import job details');
  }
  const data = await res.json();
  return data.job;
}

export async function executeImportJob(
  payload: ExecuteImportPayload
): Promise<ImportJob> {
  const res = await fetch(`/api/crm/leads/import/jobs/${payload.jobId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to execute import job');
  }

  const data = await res.json();
  return data.job;
}

export async function downloadErrorReport(
  jobId: string,
  format: 'csv' | 'json' = 'csv'
): Promise<void> {
  const res = await fetch(`/api/crm/leads/import/jobs/${jobId}/report?format=${format}`);
  if (!res.ok) {
    throw new Error('Failed to download error report');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `import-error-report-${jobId}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
