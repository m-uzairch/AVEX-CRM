# Sprint 05 - Task 009

# Client Files & Communication

Status: Completed

Priority: Medium

---

# Objective

Allow clients to access relevant project files and communicate with the AVEX CRM team through the Client Portal.

Clients should only see files and communication that are explicitly associated with them.

Reuse the existing AVEX CRM file storage and communication systems where possible.

---

# Requirements

Create:

/portal/files

/portal/messages

/portal/messages/[id]

---

# Client Files

The `/portal/files` page should display files available to the authenticated client.

Each file should show:

- File Name
- File Type
- File Size
- Related Project
- Uploaded By
- Upload Date
- Download Action

Only client-visible files should be displayed.

---

# File Categories

Where applicable, organize files into simple categories:

- Project Files
- Documents
- Invoices
- Quotations
- Other

Use existing file/document relationships where available.

Do not create unnecessary duplicate file records.

---

# File Download

Clients should be able to download files they have permission to access.

Before allowing a download, verify server-side:

- User authentication
- Client role
- Customer/company ownership
- File ownership/visibility

A client must not be able to download another client's file by changing a file ID.

---

# File Upload

If the existing AVEX CRM file system supports client uploads, allow clients to upload files related to:

- Projects
- Requests
- Communication

Validate:

- File type
- File size
- File name
- Upload permissions

Do not allow executable or dangerous file types.

Reuse the existing file storage system instead of introducing a new storage provider.

---

# Communication

Create a simple Client Portal communication section.

Clients should be able to:

- View messages
- Send messages
- Reply to existing conversations
- See message dates
- See message sender

Communication should be associated with the appropriate:

- Customer
- Company
- Project
- Request

where applicable.

---

# Messages

The `/portal/messages` page should display the client's conversations.

Each conversation should show:

- Subject
- Related Project
- Last Message
- Last Updated
- Status

The `/portal/messages/[id]` page should display the conversation.

---

# Sending Messages

Allow the client to send a message containing:

- Message text
- Optional attachment
- Related project/request where applicable

Validate the message before submitting.

Display:

- Sending state
- Success state
- Error state

---

# Message Visibility

Clients must only see messages intended for them.

Never expose:

- Internal staff conversations
- Internal notes
- Private employee messages
- Internal CRM discussions

If the existing messaging system already supports internal and external conversations, reuse that visibility mechanism.

---

# Notifications

Use the existing AVEX CRM notification/email system where available.

When a client sends a message:

- Notify the appropriate internal users.

When an internal user replies:

- Notify the client.

Do not create a separate notification system.

---

# API

Create or update the required Client Portal APIs.

The APIs should support:

- List files
- Get file
- Download file
- Upload file where supported
- List conversations
- Get conversation
- Send message
- Reply to conversation

Every API must:

- Authenticate the client.
- Verify client role.
- Resolve customer/company from the authenticated session.
- Verify ownership/visibility.
- Return only client-safe data.

---

# Security

Never trust IDs supplied by the client.

For every file and conversation request, verify:

```text
Authenticated User
        ↓
Client
        ↓
Customer / Company
        ↓
Project / Request
        ↓
File / Conversation