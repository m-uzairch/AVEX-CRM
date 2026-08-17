# Sprint 02 - Task 006

# AI Lead Import (CSV, Excel, PDF & OCR)

Status: Completed

Priority: Critical

Estimated Time: 12–16 Hours

---

# Objective

Build an AI-powered Lead Import system that allows businesses to import leads from CSV, Excel, PDF, and scanned documents.

The system should use OCR and the Gemini API to intelligently extract lead information, validate it, detect duplicates, allow user review, and import clean data into the Lead Management module.

Uploaded files must never be permanently stored.

---

# Requirements

Implement a complete AI Lead Import workflow.

The module must support:

- CSV Import
- Excel Import (.xlsx)
- PDF Import
- OCR for Images and Scanned PDFs
- AI Data Extraction
- Field Mapping
- Duplicate Detection
- Data Validation
- Import Preview
- Background Processing
- Import History
- Error Reporting

---

# Supported File Types

Allow users to upload:

- CSV
- XLSX
- PDF
- PNG
- JPG
- JPEG
- WEBP

Maximum file size:

- 20 MB

Reject unsupported file types.

---

# Upload Interface

Create an upload page.

Support:

- Drag & Drop
- Click to Upload
- Upload Progress
- Cancel Upload

Display selected file information before processing.

---

# AI Processing Flow

The workflow should follow these steps:

1. Upload File
2. Validate File
3. Detect File Type
4. Extract Raw Data
5. OCR (if required)
6. Send Structured Content to Gemini
7. Parse Lead Data
8. Detect Duplicate Leads
9. Validate Required Fields
10. Show Import Preview
11. User Confirms Import
12. Save Leads
13. Generate Import Report

Uploaded files must be deleted immediately after processing.

Do not permanently store original files.

---

# OCR

For image files and scanned PDFs:

Use OCR to extract readable text.

Support:

- Business Cards
- Printed Tables
- Scanned Documents
- Screenshots containing lead tables

OCR should run before AI extraction.

---

# Gemini AI Integration

Use the Gemini API to extract structured lead data.

Gemini should identify fields such as:

- Lead Name
- Company
- Email
- Phone
- Country
- City
- Address
- Industry
- Website
- Lead Source
- Notes

If fields are missing, return them as empty rather than guessing.

---

# Field Mapping

Allow users to review extracted fields.

Users should be able to map imported columns to CRM fields.

Examples:

CSV Column → CRM Field

Name → Lead Name

Organization → Company

Phone Number → Phone

Email Address → Email

Support saving mapping templates for future imports.

---

# Duplicate Detection

Detect duplicates using:

- Email
- Phone Number
- Company Name + Contact Name

For duplicates, provide options:

- Skip
- Update Existing
- Create New Anyway

Show duplicate warnings before import.

---

# Validation

Validate:

- Email format
- Phone number
- Required fields
- Duplicate records
- Invalid data

Highlight invalid rows.

Allow users to edit data before importing.

---

# Import Preview

Display a preview table before importing.

Include:

- Parsed Data
- Validation Status
- Duplicate Status
- Editable Fields

Allow:

- Remove Row
- Edit Row
- Skip Row

---

# Background Processing

Large imports should run as background jobs.

Display:

- Processing Status
- Progress Percentage
- Estimated Time Remaining

Users should be able to leave the page while processing continues.

---

# Import Results

After completion, display:

- Total Records
- Successfully Imported
- Failed Records
- Duplicate Records
- Processing Time

Allow downloading an import report.

---

# Import History

Create an Import History page.

Display:

- File Name
- Import Date
- Imported By
- Total Records
- Successful Imports
- Failed Imports
- Status

Do not retain the uploaded file itself.

Only keep metadata and results.

---

# Error Report

Generate a downloadable report for failed records.

Include:

- Row Number
- Error
- Suggested Fix

Support:

- CSV
- Excel

---

# Notifications

Notify the user when:

- Import Starts
- Import Completes
- Import Fails
- Background Job Finishes

Integrate with the notification system created in Sprint 01.

---

# Activity Logging

Automatically log:

- Import Started
- Import Completed
- Import Failed
- Number of Leads Imported

Display these events in the Activity Timeline.

---

# Database

Create models for:

- Import Job
- Import History
- Import Report

Do not store uploaded files.

Only store:

- Metadata
- Statistics
- Processing Results

---

# API

Create secure API endpoints for:

- Upload File
- Start Import
- Check Import Status
- Fetch Import History
- Download Report

Validate all incoming requests.

---

# Security

Ensure:

- Authentication required
- Tenant isolation
- Input validation
- File type validation
- File size validation
- Temporary file deletion after processing

Never permanently store uploaded files.

---

# Performance

Optimize for large datasets.

Requirements:

- Chunked processing
- Background jobs
- Efficient parsing
- Memory optimization
- Retry failed batches when appropriate

---

# UI

Create:

- Upload Page
- Import Wizard
- Field Mapping Screen
- Import Preview
- Processing Screen
- Import Results Page
- Import History Page
- Error Report Viewer
- Empty States
- Loading Skeletons

Follow the AVEX CRM design system.

Use subtle animations and clear progress indicators.

---

# Responsive Design

Support:

- Desktop
- Tablet
- Mobile

Optimize the import workflow for smaller screens where possible.

---

# Error Handling

Handle:

- Unsupported File Type
- Corrupted Files
- OCR Failure
- Gemini API Errors
- Duplicate Detection Errors
- Validation Errors
- Network Errors
- Background Job Failures

Display clear and user-friendly messages.

---

# Constraints

Do not implement:

- Automatic Lead Assignment
- AI Lead Scoring
- AI Sales Predictions
- AI Follow-up Recommendations

Focus only on importing and structuring lead data.

---

# Deliverables

- File Upload System
- CSV Import
- Excel Import
- PDF Import
- OCR Integration
- Gemini AI Extraction
- Field Mapping
- Duplicate Detection
- Validation System
- Import Preview
- Background Processing
- Import History
- Import Reports
- Notifications
- Activity Logging
- Secure API Endpoints

---

# Acceptance Criteria

- CSV files import successfully.
- Excel files import successfully.
- PDF files are processed correctly.
- OCR extracts text from scanned documents.
- Gemini extracts structured lead data accurately.
- Duplicate detection works.
- Validation highlights invalid records.
- Import preview allows editing.
- Background jobs process large imports.
- Uploaded files are deleted after processing.
- Import history is recorded.
- Reports can be downloaded.
- Tenant isolation is enforced.
- No TypeScript errors.
- No ESLint errors.

---

# Definition of Done

This task is complete when AVEX CRM provides a secure, AI-powered Lead Import system capable of importing leads from CSV, Excel, PDF, and scanned documents using OCR and the Gemini API, with intelligent field mapping, duplicate detection, validation, background processing, and complete audit logging, without permanently storing uploaded files.