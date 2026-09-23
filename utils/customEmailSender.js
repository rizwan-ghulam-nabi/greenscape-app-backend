export const sendCustomEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'GreenScape <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();
    console.log('📥 Resend Response:', data);

    if (data.id) {
      return { success: true, message: 'Email sent successfully', id: data.id };
    } else {
      return { success: false, error: data.message || 'Failed to send email' };
    }
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

export const sendOrderEmail = async (orderDetails) => {
  try {
    const { customerEmail, orderId, items, total } = orderDetails;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2B7A4B; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0;">🌿 GreenScape</h1>
          <p style="margin: 5px 0;">Your Green Friends Are On The Way!</p>
        </div>
        <div style="padding: 20px; border: 1px solid #e0e0e0;">
          <h2 style="color: #2B7A4B;">Order Confirmation</h2>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total:</strong> Rs. ${total}</p>
          <h3 style="color: #2B7A4B; margin-top: 20px;">Order Items:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f5f5f5;">
              <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
              <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Qty</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
            </tr>
            ${items && items.map(item => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">Rs. ${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <p style="color: #666;">Thank you for shopping with GreenScape!</p>
          </div>
        </div>
      </div>
    `;

    return await sendCustomEmail({
      to: customerEmail,
      subject: `Order Confirmation - GreenScape #${orderId}`,
      html: emailHtml,
    });
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
};

export const sendTestEmail = async (email) => {
  try {
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="color: #2B7A4B;">🌿 GreenScape Test Email</h2>
        <p>This is a test email to confirm your Resend setup is working!</p>
        <p>If you received this, your email configuration is correct.</p>
      </div>
    `;

    return await sendCustomEmail({
      to: email,
      subject: 'Test Email - GreenScape',
      html: emailHtml,
    });
  } catch (error) {
    console.error('❌ Test email error:', error);
    return { success: false, error: error.message || 'Failed to send test email' };
  }
};