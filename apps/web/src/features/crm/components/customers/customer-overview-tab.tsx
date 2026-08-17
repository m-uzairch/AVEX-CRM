'use client';

import * as React from 'react';
import { Customer, AssignedEmployee } from '../../types/customer-types';
import { CustomerService } from '../../services/customer-service';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Tag,
  Briefcase,
  Calendar,
  UserCheck,
  Plus,
  X,
  ShieldCheck,
  Clock,
} from 'lucide-react';

export interface CustomerOverviewTabProps {
  customer: Customer;
  onCustomerUpdated: () => void;
}

export function CustomerOverviewTab({ customer, onCustomerUpdated }: CustomerOverviewTabProps) {
  const [newTagInput, setNewTagInput] = React.useState('');
  const [isAddingTag, setIsAddingTag] = React.useState(false);
  const [employees, setEmployees] = React.useState<AssignedEmployee[]>([]);
  const [isReassigning, setIsReassigning] = React.useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState(customer.assignedEmployeeId || '');

  React.useEffect(() => {
    CustomerService.getEmployees().then(setEmployees);
  }, []);

  React.useEffect(() => {
    setSelectedEmployeeId(customer.assignedEmployeeId || '');
  }, [customer.assignedEmployeeId]);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;

    try {
      await CustomerService.addTag(customer.id, newTagInput.trim());
      setNewTagInput('');
      setIsAddingTag(false);
      onCustomerUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add tag');
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    try {
      await CustomerService.removeTag(customer.id, tagToRemove);
      onCustomerUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove tag');
    }
  };

  const handleReassignEmployee = async () => {
    try {
      await CustomerService.assignEmployee(customer.id, selectedEmployeeId || null);
      setIsReassigning(false);
      onCustomerUpdated();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reassign employee');
    }
  };

  const currentEmployee = employees.find((e) => e.id === customer.assignedEmployeeId) || {
    id: 'emp_001',
    name: customer.assignedEmployeeName || 'Alex Carter',
    email: 'alex.carter@avex.com',
    role: 'Account Executive',
  };

  return (
    <div className="space-y-6">
      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="shadow-xs border-border">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Full Name</span>
              <span className="font-semibold text-foreground text-sm">{customer.name}</span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Email Address</span>
              <a href={`mailto:${customer.email}`} className="font-semibold text-primary hover:underline flex items-center space-x-1.5">
                <Mail className="h-3.5 w-3.5" />
                <span>{customer.email}</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Phone Number</span>
                <a href={`tel:${customer.phone}`} className="font-semibold text-foreground hover:underline flex items-center space-x-1">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{customer.phone}</span>
                </a>
              </div>
              {customer.alternatePhone && (
                <div>
                  <span className="text-muted-foreground block text-[11px] font-medium">Alternate Phone</span>
                  <span className="font-semibold text-foreground">{customer.alternatePhone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="shadow-xs border-border">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>Company Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Company Name</span>
              <span className="font-semibold text-foreground text-sm">{customer.companyName}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Industry</span>
                <span className="font-semibold text-foreground">{customer.industry || 'Not Specified'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Business Type</span>
                <span className="font-semibold text-foreground">{customer.businessType || 'DIGITAL'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Company Size</span>
                <span className="font-semibold text-foreground">{customer.companySize || '10-50 employees'}</span>
              </div>
              {customer.website && (
                <div>
                  <span className="text-muted-foreground block text-[11px] font-medium">Website</span>
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-primary hover:underline flex items-center space-x-1 truncate"
                  >
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{customer.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card className="shadow-xs border-border">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>Address & Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Street Address</span>
              <span className="font-semibold text-foreground">{customer.address || 'No street address provided'}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">City</span>
                <span className="font-semibold text-foreground">{customer.city || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">State / Province</span>
                <span className="font-semibold text-foreground">{customer.state || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Postal Code</span>
                <span className="font-semibold text-foreground">{customer.postalCode || 'N/A'}</span>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Country</span>
              <span className="font-semibold text-foreground">{customer.country || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* CRM Metadata Information */}
        <Card className="shadow-xs border-border">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              <span>CRM Lifecycle Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Customer Source</span>
                <span className="font-semibold text-foreground">{customer.source || 'Direct Registration'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Priority</span>
                <Badge variant={customer.priority === 'HIGH' || customer.priority === 'URGENT' ? 'destructive' : 'secondary'} className="text-[10px] uppercase font-bold mt-0.5">
                  {customer.priority}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Customer Since</span>
                <span className="font-semibold text-foreground flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Last Profile Update</span>
                <span className="font-semibold text-foreground flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{new Date(customer.updatedAt).toLocaleDateString()}</span>
                </span>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Account Security Isolation</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center space-x-1 pt-0.5">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Tenant Isolated (Company ID: {customer.companyId.substring(0, 8)})</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Customer Tags & Assigned Employee Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Tags Card */}
        <Card className="shadow-xs border-border">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
              <Tag className="h-3.5 w-3.5 text-purple-500" />
              <span>Customer Tags</span>
            </CardTitle>
            {!isAddingTag && (
              <Button variant="outline" size="sm" onClick={() => setIsAddingTag(true)} className="h-7 text-[11px] px-2">
                <Plus className="h-3 w-3 mr-1" /> Add Tag
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {isAddingTag && (
              <form onSubmit={handleAddTag} className="flex items-center space-x-2 pb-2">
                <input
                  type="text"
                  placeholder="Enter custom tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  className="px-2.5 py-1 rounded-md border border-border bg-background text-xs focus:outline-hidden focus:ring-1 focus:ring-primary flex-1"
                  autoFocus
                />
                <Button type="submit" size="sm" className="h-7 text-xs px-2.5">
                  Save
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingTag(false)} className="h-7 text-xs px-2">
                  Cancel
                </Button>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {customer.tags && customer.tags.length > 0 ? (
                customer.tags.map((t, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs py-1 px-2.5 flex items-center space-x-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 border">
                    <span>{t}</span>
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="ml-1 hover:text-destructive transition-colors"
                      title="Remove tag"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic">No custom tags assigned to this customer account.</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assigned Employee Card */}
        <Card className="shadow-xs border-border">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
              <UserCheck className="h-3.5 w-3.5 text-blue-500" />
              <span>Assigned Account Manager</span>
            </CardTitle>
            {!isReassigning && (
              <Button variant="outline" size="sm" onClick={() => setIsReassigning(true)} className="h-7 text-[11px] px-2">
                Change Manager
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            {isReassigning ? (
              <div className="space-y-3">
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full p-2 rounded-md border border-border bg-background text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsReassigning(false)} className="h-7 text-xs px-2">
                    Cancel
                  </Button>

                  <Button size="sm" onClick={handleReassignEmployee} className="h-7 text-xs px-3">
                    Save Assignment
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3.5">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 font-bold text-sm flex items-center justify-center border border-blue-500/20 shrink-0">
                  {currentEmployee.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-foreground flex items-center space-x-1.5">
                    <span>{currentEmployee.name}</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                      {currentEmployee.role}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground block">{currentEmployee.email}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
