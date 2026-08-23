# Sprint 05 - Task 006

# Client Invoices & Quotations

Status: Completed

Priority: High

---

# Objective

Allow clients to view their quotations and invoices through the Client Portal.

Clients should be able to see their financial documents, their current status, amounts, dates, and relevant details.

Use the existing AVEX CRM invoice and quotation systems.

Do not create a separate financial system for the Client Portal.

---

# Requirements

Create:

/portal/quotations

/portal/quotations/[id]

/portal/invoices

/portal/invoices/[id]

---

# Quotations List

The `/portal/quotations` page should display quotations belonging to the authenticated client.

Each quotation should show:

- Quotation Number
- Date
- Expiry Date
- Status
- Total Amount
- Currency

Possible statuses may include:

- Draft
- Sent
- Accepted
- Rejected
- Expired

Use the existing quotation status system.

---

# Quotation Details

The quotation details page should display:

- Quotation Number
- Quotation Date
- Expiry Date
- Status
- Customer Information
- Company Information
- Items
- Quantity
- Unit Price
- Discounts
- Taxes
- Subtotal
- Total
- Notes
- Terms & Conditions

Only display information that is appropriate for the client.

---

# Quotation PDF

Allow the client to:

- View quotation PDF
- Download quotation PDF
- Print quotation

Reuse the existing quotation PDF generation system.

Do not create a duplicate PDF generation system.

---

# Invoices List

The `/portal/invoices` page should display invoices belonging to the authenticated client.

Each invoice should show:

- Invoice Number
- Invoice Date
- Due Date
- Status
- Total Amount
- Amount Paid
- Amount Due
- Currency

Possible statuses may include:

- Draft
- Sent
- Paid
- Partially Paid
- Overdue
- Cancelled

Use the existing invoice status system.

---

# Invoice Details

The invoice details page should display:

- Invoice Number
- Invoice Date
- Due Date
- Status
- Customer Information
- Company Information
- Items
- Quantity
- Unit Price
- Discounts
- Taxes
- Subtotal
- Total
- Amount Paid
- Amount Due
- Notes
- Terms & Conditions

Only display client-safe information.

Do not expose:

- Internal costs
- Employee information
- Internal notes
- Internal financial calculations
- Internal company data not intended for the client

---

# Invoice PDF

Allow the client to:

- View invoice PDF
- Download invoice PDF
- Print invoice

Reuse the existing invoice PDF generation system.

Do not create a second PDF generation implementation.

---

# Payment Status

Clearly display the current payment status.

Examples:

```text
Paid