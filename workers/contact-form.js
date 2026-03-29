export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders 
      });
    }

    try {
      // Parse form data
      const formData = await request.formData();
      const name = formData.get('name');
      const email = formData.get('email');
      const company = formData.get('company') || 'Not provided';
      const project = formData.get('project');
      const message = formData.get('message');

      // Validation
      if (!name || !email || !project || !message) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Missing required fields' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Telegram configuration
      const TELEGRAM_BOT_TOKEN = '8654463682:AAH1i9ZZtvctgE1W_8hLIaBy0KSGyqmatOE';
      const TELEGRAM_CHAT_ID = '929009215';

      // Telegram message (formatted for readability)
      const telegramMessage = `
🚀 <b>New Contact Form Submission</b>

👤 <b>Name:</b> ${name}
📧 <b>Email:</b> ${email}
🏢 <b>Company:</b> ${company}
📋 <b>Project Type:</b> ${project}

💬 <b>Message:</b>
${message}

━━━━━━━━━━━━━━━━━━━━━━━
🌐 <b>From:</b> https://barbuk.us/contact
🕒 <b>Time:</b> ${new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })}
      `.trim();

      // Send Telegram notification
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: telegramMessage,
            parse_mode: 'HTML'
          })
        }
      );

      if (!telegramResponse.ok) {
        const error = await telegramResponse.text();
        console.error('Telegram API error:', error);
        throw new Error('Failed to send Telegram notification');
      }

      // Success response
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Thank you! We will get back to you within 24 hours.' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error processing form:', error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to send message. Please try again or email us directly at hello@barbuk.us' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
