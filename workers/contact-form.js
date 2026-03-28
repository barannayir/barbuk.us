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

      // Email body
      const emailBody = `
New Contact Form Submission from Barbuk.us
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Name: ${name}
📧 Email: ${email}
🏢 Company: ${company}
📋 Project Type: ${project}

💬 Message:
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Sent from: https://barbuk.us/contact
Time: ${new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })} (Istanbul)
      `.trim();

      // Send email via MailChannels (free on Cloudflare Workers)
      const emailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: 'hello@barbuk.us', name: 'Barbuk Team' }],
              reply_to: { email: email, name: name }
            }
          ],
          from: {
            email: 'noreply@barbuk.us',
            name: 'Barbuk Contact Form'
          },
          subject: `🚀 New Contact: ${project} - ${name}`,
          content: [
            {
              type: 'text/plain',
              value: emailBody
            }
          ]
        })
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send email');
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
