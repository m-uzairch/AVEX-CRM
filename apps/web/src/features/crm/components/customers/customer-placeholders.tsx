'use client';

import * as React from 'react';
import {
  CustomerProjectItem,
  CustomerInvoiceItem,
  CustomerFileItem,
  CustomerMeetingItem,
} from '../../types/customer-types';
import { CustomerService } from '../../services/customer-service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  FolderKanban,
  FileText,
  FileSpreadsheet,
  Calendar,
  Clock,
  Download,
  Plus,
  Users,
} from 'lucide-react';

export interface CustomerPlaceholderProps {
  customerId: string;
}

/**
 * Projects Tab Component
 */
export function CustomerProjectsTab({ customerId }: CustomerPlaceholderProps) {
  const [projects, setProjects] = React.useState<CustomerProjectItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    CustomerService.getProjects(customerId).then((res) => {
      setProjects(res);
      setIsLoading(false);
    });
  }, [customerId]);

  return (
    <Card className="shadow-xs border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center space-x-2">
          <FolderKanban className="h-4 w-4 text-blue-500" />
          <CardTitle className="text-base font-bold">Associated Projects</CardTitle>
          <Badge variant="secondary" className="text-xs">Sprint 03 Module Preview</Badge>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={() => alert('Projects module full creation available in Sprint 03')}>
          <Plus className="h-3.5 w-3.5 mr-1" /> New Project
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
            No projects associated with this customer yet.
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id} className="p-4 rounded-lg border border-border bg-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs text-foreground flex items-center space-x-2">
                      <span>{proj.name}</span>
                      <Badge
                        variant={proj.status === 'IN_PROGRESS' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {proj.status.replace('_', ' ')}
                      </Badge>
                    </h4>
                    <span className="text-[11px] text-muted-foreground flex items-center space-x-1 mt-0.5">
                      <Users className="h-3 w-3" />
                      <span>Assigned Team: {proj.assignedTeam}</span>
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground space-y-0.5 sm:text-right">
                    <div>Timeline: <span className="font-medium text-foreground">{proj.startDate}</span> to <span className="font-medium text-foreground">{proj.dueDate}</span></div>
                    <div className="font-semibold text-primary">{proj.progressPercent}% Completed</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${proj.progressPercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Invoices Tab Component
 */
export function CustomerInvoicesTab({ customerId }: CustomerPlaceholderProps) {
  const [invoices, setInvoices] = React.useState<CustomerInvoiceItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    CustomerService.getInvoices(customerId).then((res) => {
      setInvoices(res);
      setIsLoading(false);
    });
  }, [customerId]);

  return (
    <Card className="shadow-xs border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
          <CardTitle className="text-base font-bold">Billing & Invoices</CardTitle>
          <Badge variant="secondary" className="text-xs">Invoice Module Preview</Badge>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={() => alert('Invoice generator module available in future sprint')}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Generate Invoice
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
            No invoices generated for this customer yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 text-muted-foreground font-semibold uppercase text-[10px] border-b border-border">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Payment Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-3 font-bold text-foreground">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 font-semibold text-foreground">${inv.amount.toLocaleString()} {inv.currency}</td>
                    <td className="py-3 px-3 text-muted-foreground">{inv.dueDate}</td>
                    <td className="py-3 px-3">
                      <Badge
                        variant={inv.status === 'PAID' ? 'default' : inv.status === 'UNPAID' ? 'destructive' : 'secondary'}
                        className="text-[10px]"
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => alert(`Downloading Invoice ${inv.invoiceNumber}`)}>
                        <Download className="h-3 w-3 mr-1" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Files Tab Component
 */
export function CustomerFilesTab({ customerId }: CustomerPlaceholderProps) {
  const [files, setFiles] = React.useState<CustomerFileItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    CustomerService.getFiles(customerId).then((res) => {
      setFiles(res);
      setIsLoading(false);
    });
  }, [customerId]);

  return (
    <Card className="shadow-xs border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-amber-500" />
          <CardTitle className="text-base font-bold">Documents & Files</CardTitle>
          <Badge variant="secondary" className="text-xs">UI Preview</Badge>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={() => alert('Document upload pipeline will be connected in future sprint')}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Upload Document
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
            No document files uploaded for this customer yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((file) => (
              <div key={file.id} className="p-3.5 rounded-lg border border-border bg-card flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-500/20 font-bold text-xs">
                    {file.fileType}
                  </div>
                  <div className="overflow-hidden space-y-0.5">
                    <p className="font-semibold text-xs text-foreground truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-muted-foreground">
                      <Badge variant="outline" className="text-[9px] py-0 px-1">{file.category}</Badge>
                      <span>{file.fileSize}</span>
                      <span>•</span>
                      <span>{file.uploadedAt}</span>
                    </div>
                  </div>
                </div>

                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => alert(`Downloading ${file.name}`)}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Meetings Tab Component
 */
export function CustomerMeetingsTab({ customerId }: CustomerPlaceholderProps) {
  const [meetings, setMeetings] = React.useState<CustomerMeetingItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    CustomerService.getMeetings(customerId).then((res) => {
      setMeetings(res);
      setIsLoading(false);
    });
  }, [customerId]);

  return (
    <Card className="shadow-xs border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <CardTitle className="text-base font-bold">Meetings & Calls</CardTitle>
          <Badge variant="secondary" className="text-xs">Google Calendar Sync Preview</Badge>
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={() => alert('Google Calendar sync scheduled for future sprint')}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Schedule Meeting
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex justify-center p-8"><Spinner /></div>
        ) : meetings.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
            No meetings scheduled or recorded for this customer.
          </div>
        ) : (
          <div className="space-y-3">
            {meetings.map((m) => (
              <div key={m.id} className="p-4 rounded-lg border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-bold text-foreground">{m.title}</h4>
                    <Badge variant={m.status === 'SCHEDULED' ? 'default' : 'outline'} className="text-[10px]">
                      {m.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{m.date}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{m.time}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{m.attendeesCount} Attendees</span>
                    </span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 self-start sm:self-center" onClick={() => alert(`Meeting details for ${m.title}`)}>
                  View Agenda
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
