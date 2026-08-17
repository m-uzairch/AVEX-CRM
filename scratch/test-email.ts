async function testEmailEndpoints() {
  console.log('Testing Email Endpoints...');

  // 1. Test Invoice Email
  try {
    const resInv = await fetch('http://127.0.0.1:3000/api/invoices/inv_001/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: 'client@cyberdyne.io',
        subject: 'Invoice INV-000001 from AVEX CRM',
        message: 'Please process attached invoice.',
      }),
    });
    console.log('Invoice Email Response Status:', resInv.status);
    const dataInv = await resInv.json();
    console.log('Invoice Email Response Body:', dataInv);
  } catch (err: any) {
    console.error('Invoice Email Error:', err.message);
  }

  // 2. Test Quotation Email
  try {
    const resQuote = await fetch('http://127.0.0.1:3000/api/quotations/qtn_001/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientEmail: 'sarah@cyberdyne.io',
        subject: 'Quotation QTN-000001 from AVEX CRM',
        message: 'Please review attached quote.',
      }),
    });
    console.log('Quotation Email Response Status:', resQuote.status);
    const dataQuote = await resQuote.json();
    console.log('Quotation Email Response Body:', dataQuote);
  } catch (err: any) {
    console.error('Quotation Email Error:', err.message);
  }
}

testEmailEndpoints();
