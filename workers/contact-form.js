export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405, corsHeaders);
    }

    try {
      const formData = await request.formData();
      const name = (formData.get('name') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const company = (formData.get('company') || '').toString().trim();
      const project = (formData.get('project') || '').toString().trim();
      const message = (formData.get('message') || '').toString().trim();
      const locale = (formData.get('locale') || 'en').toString().trim();
      const honeypot = (formData.get('website_url') || '').toString().trim();

      if (!name || !email || !project || !message) {
        return jsonResponse(
          { success: false, error: 'Please fill in all required fields.' },
          400,
          corsHeaders
        );
      }

      if (!isValidEmail(email)) {
        return jsonResponse(
          { success: false, error: 'Please enter a valid email address.' },
          400,
          corsHeaders
        );
      }

      if (message.length < 10) {
        return jsonResponse(
          { success: false, error: 'Message is too short (minimum 10 characters).' },
          400,
          corsHeaders
        );
      }

      // Honeypot: bots auto-fill all fields, humans never see this — silent success, no Sheet write
      if (honeypot) {
        return jsonResponse(
          { success: true, message: 'Thank you! We will get back to you within 24 hours.' },
          200,
          corsHeaders
        );
      }

      const appsScriptUrl = env.APPS_SCRIPT_URL;
      if (!appsScriptUrl) {
        console.error('APPS_SCRIPT_URL env is not set');
        return jsonResponse(
          {
            success: false,
            error: 'Server is temporarily unavailable. Please email us directly at hello@barbuk.us',
          },
          500,
          corsHeaders
        );
      }

      const appsScriptResponse = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          project,
          message,
          locale,
          website_url: honeypot, // defense in depth: Apps Script also checks honeypot
        }),
      });

      // Apps Script may 302-redirect for non-browser clients; fetch follows by default.
      if (!appsScriptResponse.ok) {
        console.error('Apps Script HTTP error:', appsScriptResponse.status);
        return jsonResponse(
          {
            success: false,
            error: 'Failed to send message. Please try again or email us directly at hello@barbuk.us',
          },
          502,
          corsHeaders
        );
      }

      let appsScriptResult;
      try {
        appsScriptResult = await appsScriptResponse.json();
      } catch (parseErr) {
        console.error('Apps Script response parse error:', parseErr);
        return jsonResponse(
          {
            success: false,
            error: 'Failed to send message. Please try again or email us directly at hello@barbuk.us',
          },
          502,
          corsHeaders
        );
      }

      if (!appsScriptResult.ok) {
        console.error('Apps Script returned ok:false:', appsScriptResult.error);
        return jsonResponse(
          {
            success: false,
            error: 'Failed to send message. Please try again or email us directly at hello@barbuk.us',
          },
          502,
          corsHeaders
        );
      }

      return jsonResponse(
        { success: true, message: 'Thank you! We will get back to you within 24 hours.' },
        200,
        corsHeaders
      );
    } catch (err) {
      console.error('Worker unexpected error:', err);
      return jsonResponse(
        {
          success: false,
          error: 'Failed to send message. Please try again or email us directly at hello@barbuk.us',
        },
        500,
        corsHeaders
      );
    }
  },
};

function jsonResponse(body, status, corsHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
