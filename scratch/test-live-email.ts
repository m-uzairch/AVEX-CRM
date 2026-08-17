async function testLiveEmailEndpoint() {
  const base = 'http://127.0.0.1:3000';

  console.log('Testing live invoice email endpoint...');
  try {
    const res = await fetch(`${base}/api/invoices/inv_001/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: 'uzairchaudhary235@gmail.com',
        subject: 'Test Invoice Email from AVEX CRM',
        message: 'This is a test email for the invoice.',
      }),
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error('Request Error:', err.message);
  }

  console.log('\nTesting live quotation email endpoint...');
  try {
    const res = await fetch(`${base}/api/quotations/qtn_001/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: 'uzairchaudhary235@gmail.com',
        subject: 'Test Quotation Email from AVEX CRM',
        message: 'This is a test email for the quotation.',
      }),
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error('Request Error:', err.message);
  }
}

testLiveEmailEndpoint();
