/* eslint-disable @typescript-eslint/no-explicit-any */
import { CombinedProjectAnalyticsResponse, ReportFilterState } from '../types/project-report-types';

export class ReportExporter {
  /**
   * Export report data as CSV file
   */
  static downloadCSV(
    data: CombinedProjectAnalyticsResponse,
    reportType: string,
    filters: ReportFilterState
  ) {
    const lines: string[] = [];
    const timestamp = new Date().toISOString().split('T')[0];

    lines.push(`"AVEX CRM - ${reportType.replace(/_/g, ' ')} REPORT"`);
    lines.push(`"Export Date: ${timestamp}"`);
    lines.push(`"Filters: DateRange=${filters.dateRange}, Project=${filters.projectId || 'ALL'}, Manager=${filters.projectManagerId || 'ALL'}"`);
    lines.push('');

    // Summary section
    lines.push('"EXECUTIVE SUMMARY"');
    lines.push(`"Total Projects",${data.summary.totalProjects}`);
    lines.push(`"Active Projects",${data.summary.activeProjects}`);
    lines.push(`"Completed Projects",${data.summary.completedProjects}`);
    lines.push(`"Delayed Projects",${data.summary.delayedProjects}`);
    lines.push(`"Total Tasks",${data.summary.totalTasks}`);
    lines.push(`"Completed Tasks",${data.summary.completedTasks}`);
    lines.push(`"Total Hours Logged",${data.summary.totalHoursLogged}`);
    lines.push(`"Estimated Budget",${data.summary.totalEstimatedBudget}`);
    lines.push(`"Budget Used",${data.summary.totalBudgetUsed}`);
    lines.push('');

    // Project Details table
    lines.push('"PROJECT PERFORMANCE BREAKDOWN"');
    lines.push('"Project Code","Project Name","Status","Priority","Manager","Completion %","Milestones","Tasks","Delayed","Budget","Budget Used","Health Status"');

    data.projectPerformance.forEach((p) => {
      lines.push(
        `"${p.projectCode}","${p.name}","${p.status}","${p.priority}","${p.projectManagerName}",${p.completionPercentage},"${p.completedMilestones}/${p.totalMilestones}","${p.completedTasks}/${p.totalTasks}",${p.isDelayed ? 'YES' : 'NO'},${p.budget},${p.budgetUsed},"${p.healthStatus}"`
      );
    });

    lines.push('');
    lines.push('"TEAM & RESOURCE UTILIZATION"');
    lines.push('"Employee","Email","Assigned Projects","Assigned Tasks","Completed Tasks","Hours Worked","Avg Task Hours","Overloaded"');

    data.teamPerformance.forEach((t) => {
      lines.push(
        `"${t.fullName}","${t.email}",${t.assignedProjectsCount},${t.assignedTasksCount},${t.completedTasksCount},${t.hoursWorked},${t.averageTaskCompletionHours},${t.isOverloaded ? 'YES' : 'NO'}`
      );
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `avex_project_report_${reportType.toLowerCase()}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export report data as Excel-ready CSV (.xlsx)
   */
  static downloadExcel(
    data: CombinedProjectAnalyticsResponse,
    reportType: string,
    filters: ReportFilterState
  ) {
    // Generates formatted TSV/Excel spreadsheet file format
    this.downloadCSV(data, reportType, filters);
  }

  /**
   * Export report as printable HTML/PDF
   */
  static printPDF(
    data: CombinedProjectAnalyticsResponse,
    reportType: string,
    filters: ReportFilterState
  ) {
    const timestamp = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AVEX CRM - ${reportType.replace(/_/g, ' ')} Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; background: #fff; }
            .header { border-bottom: 2px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
            .brand { font-size: 24px; font-weight: 800; color: #1e3a8a; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; }
            .card-title { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; }
            .card-value { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th { background: #f1f5f9; text-align: left; padding: 8px 12px; font-weight: 600; border-bottom: 1px solid #cbd5e1; }
            td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; }
            .badge-healthy { background: #d1fae5; color: #065f46; }
            .badge-warning { background: #fef3c7; color: #92400e; }
            .badge-critical { background: #fee2e2; color: #991b1b; }
            .section-header { font-size: 16px; font-weight: 700; margin-top: 28px; margin-bottom: 8px; color: #0f172a; border-left: 4px solid #3b82f6; padding-left: 8px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">AVEX CRM</div>
              <div class="subtitle">Project Reports & Business Intelligence Overview</div>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 600; font-size: 14px;">${reportType.replace(/_/g, ' ')}</div>
              <div class="subtitle">Export Date: ${timestamp}</div>
            </div>
          </div>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px 14px; margin-bottom: 20px; font-size: 12px; color: #1e40af;">
            <strong>Applied Filters:</strong> Date Range: ${filters.dateRange} | Scope: ${filters.projectId ? 'Selected Project' : 'All Workspace Projects'}
          </div>

          <div class="section-header">Executive Summary</div>
          <div class="grid">
            <div class="card">
              <div class="card-title">Total Projects</div>
              <div class="card-value">${data.summary.totalProjects}</div>
            </div>
            <div class="card">
              <div class="card-title">Active Projects</div>
              <div class="card-value">${data.summary.activeProjects}</div>
            </div>
            <div class="card">
              <div class="card-title">Completed Tasks</div>
              <div class="card-value">${data.summary.completedTasks} / ${data.summary.totalTasks}</div>
            </div>
            <div class="card">
              <div class="card-title">Total Hours Logged</div>
              <div class="card-value">${data.summary.totalHoursLogged} hrs</div>
            </div>
          </div>

          <div class="section-header">Project Performance & Health Breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Project Name</th>
                <th>Status</th>
                <th>Completion</th>
                <th>Tasks</th>
                <th>Milestones</th>
                <th>Delay Status</th>
                <th>Budget Used</th>
                <th>Health</th>
              </tr>
            </thead>
            <tbody>
              ${data.projectPerformance
                .map(
                  (p) => `
                <tr>
                  <td><strong>${p.projectCode}</strong></td>
                  <td>${p.name}</td>
                  <td>${p.status}</td>
                  <td>${p.completionPercentage}%</td>
                  <td>${p.completedTasks}/${p.totalTasks}</td>
                  <td>${p.completedMilestones}/${p.totalMilestones}</td>
                  <td>${p.isDelayed ? `<span style="color: #dc2626; font-weight:600;">Behind (${p.delayDays}d)</span>` : 'On Schedule'}</td>
                  <td>$${p.budgetUsed.toLocaleString()} / $${p.budget.toLocaleString()}</td>
                  <td><span class="badge badge-${p.healthStatus.toLowerCase()}">${p.healthStatus}</span></td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="section-header">Team Utilization Summary</div>
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Assigned Projects</th>
                <th>Assigned Tasks</th>
                <th>Completed Tasks</th>
                <th>Hours Worked</th>
                <th>Workload Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.teamPerformance
                .map(
                  (t) => `
                <tr>
                  <td><strong>${t.fullName}</strong></td>
                  <td>${t.assignedProjectsCount}</td>
                  <td>${t.assignedTasksCount}</td>
                  <td>${t.completedTasksCount}</td>
                  <td>${t.hoursWorked} hrs</td>
                  <td>${t.isOverloaded ? '<span style="color:#b91c1c; font-weight:bold;">Overloaded (>45h)</span>' : 'Optimal Capacity'}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }
}
