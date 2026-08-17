/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME_TYPES: Record<string, 'PDF' | 'DOCX' | 'XLSX' | 'PNG' | 'JPG' | 'JPEG' | 'OTHER'> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-excel': 'XLSX',
  'image/png': 'PNG',
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG',
};

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.png', '.jpg', '.jpeg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit of 10MB.' },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          error: `File format ${ext} is not supported. Supported formats: PDF, DOCX, XLSX, PNG, JPG, JPEG.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const fileId = uuidv4();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedFileName = `${fileId}_${safeName}`;
    const filePath = path.join(uploadsDir, storedFileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${storedFileName}`;
    const detectedType = ALLOWED_MIME_TYPES[file.type] || (ext.includes('pdf') ? 'PDF' : ext.includes('doc') ? 'DOCX' : ext.includes('xls') ? 'XLSX' : ext.includes('png') ? 'PNG' : 'JPG');

    const attachmentMetadata = {
      id: fileId,
      fileName: file.name,
      fileUrl,
      fileType: detectedType,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    };

    return NextResponse.json({ attachment: attachmentMetadata }, { status: 201 });
  } catch (error) {
    console.error('[API POST /api/crm/attachments] Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload attachment file.' },
      { status: 500 }
    );
  }
}
