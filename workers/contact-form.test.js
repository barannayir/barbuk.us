// Unit tests for contact-form Worker
// Run: node --test workers/contact-form.test.js
// Node 18+ required (global fetch, FormData, Request, Response)

import { test, describe, mock } from 'node:test';
import assert from 'node:assert/strict';

const workerModule = await import('./contact-form.js');
const worker = workerModule.default;

const TEST_ENV = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/TEST/exec',
};

function makeRequest(method) {
  return new Request('https://barbuk-contact-form.barannayir.workers.dev', { method });
}

function makeFormDataRequest(fields) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v);
  }
  return new Request('https://barbuk-contact-form.barannayir.workers.dev', {
    method: 'POST',
    body: fd,
  });
}

function mockAppsScript(responseBody, status = 200) {
  const original = globalThis.fetch;
  globalThis.fetch = mock.fn(async () => {
    return new Response(JSON.stringify(responseBody), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  });
  return () => {
    globalThis.fetch = original;
  };
}

describe('CORS preflight', () => {
  test('OPTIONS returns 204 with CORS headers', async () => {
    const res = await worker.fetch(makeRequest('OPTIONS'), TEST_ENV);
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), '*');
    assert.equal(
      res.headers.get('Access-Control-Allow-Methods'),
      'POST, OPTIONS'
    );
  });
});

describe('Method validation', () => {
  test('GET returns 405', async () => {
    const res = await worker.fetch(makeRequest('GET'), TEST_ENV);
    assert.equal(res.status, 405);
    const body = await res.json();
    assert.equal(body.success, false);
  });
});

describe('Required field validation', () => {
  const baseFields = {
    name: 'Alice',
    email: 'alice@example.com',
    project: 'Other',
    message: 'This is a long enough message.',
  };

  for (const missing of ['name', 'email', 'project', 'message']) {
    test(`missing ${missing} → 400`, async () => {
      const fields = { ...baseFields };
      delete fields[missing];
      const res = await worker.fetch(makeFormDataRequest(fields), TEST_ENV);
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.error, /required|fill/i);
    });
  }
});

describe('Email validation', () => {
  test('invalid email format → 400', async () => {
    const res = await worker.fetch(
      makeFormDataRequest({
        name: 'Test',
        email: 'not-an-email',
        project: 'Other',
        message: 'Hello there please help me',
      }),
      TEST_ENV
    );
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /email/i);
  });

  test('valid email + valid payload → 200 (Apps Script mocked)', async () => {
    const restore = mockAppsScript({ ok: true, row: 5 });
    try {
      const res = await worker.fetch(
        makeFormDataRequest({
          name: 'Alice',
          email: 'alice@example.com',
          company: 'Acme',
          project: 'Cloud Migration',
          message: 'We need to migrate our ERP system.',
          locale: 'en',
        }),
        TEST_ENV
      );
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.match(body.message, /24 hours/);
    } finally {
      restore();
    }
  });
});

describe('Message length validation', () => {
  test('message < 10 chars → 400', async () => {
    const res = await worker.fetch(
      makeFormDataRequest({
        name: 'Test',
        email: 'a@b.com',
        project: 'Other',
        message: 'short',
      }),
      TEST_ENV
    );
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.error, /short|10/i);
  });
});

describe('Honeypot', () => {
  test('website_url filled → silent success, Apps Script NOT called', async () => {
    let fetchCalled = false;
    const original = globalThis.fetch;
    globalThis.fetch = mock.fn(async () => {
      fetchCalled = true;
      return new Response('{}');
    });
    try {
      const res = await worker.fetch(
        makeFormDataRequest({
          name: 'Bot',
          email: 'bot@spam.com',
          project: 'Other',
          message: 'Buy cheap watches now click here please',
          website_url: 'http://spam.example.com',
        }),
        TEST_ENV
      );
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.match(body.message, /24 hours/);
      assert.equal(fetchCalled, false, 'Apps Script should NOT be called');
    } finally {
      globalThis.fetch = original;
    }
  });

  test('empty website_url → Apps Script called', async () => {
    const restore = mockAppsScript({ ok: true, row: 10 });
    try {
      const res = await worker.fetch(
        makeFormDataRequest({
          name: 'Real User',
          email: 'real@user.com',
          project: 'Other',
          message: 'I am a real human with a real question.',
          website_url: '',
        }),
        TEST_ENV
      );
      assert.equal(res.status, 200);
      assert.equal(globalThis.fetch.mock.calls.length, 1);
    } finally {
      restore();
    }
  });
});

describe('Apps Script error propagation', () => {
  test('Apps Script returns ok:false → 502', async () => {
    const restore = mockAppsScript({ ok: false, error: 'sheet locked' });
    try {
      const res = await worker.fetch(
        makeFormDataRequest({
          name: 'Test',
          email: 'a@b.com',
          project: 'Other',
          message: 'Hello there please help me',
        }),
        TEST_ENV
      );
      assert.equal(res.status, 502);
      const body = await res.json();
      assert.equal(body.success, false);
    } finally {
      restore();
    }
  });

  test('Apps Script returns HTTP 500 → 502', async () => {
    const restore = mockAppsScript({ error: 'server error' }, 500);
    try {
      const res = await worker.fetch(
        makeFormDataRequest({
          name: 'Test',
          email: 'a@b.com',
          project: 'Other',
          message: 'Hello there please help me',
        }),
        TEST_ENV
      );
      assert.equal(res.status, 502);
    } finally {
      restore();
    }
  });

  test('Apps Script returns invalid JSON → 502', async () => {
    const original = globalThis.fetch;
    globalThis.fetch = mock.fn(async () => {
      return new Response('not json at all', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    });
    try {
      const res = await worker.fetch(
        makeFormDataRequest({
          name: 'Test',
          email: 'a@b.com',
          project: 'Other',
          message: 'Hello there please help me',
        }),
        TEST_ENV
      );
      assert.equal(res.status, 502);
    } finally {
      globalThis.fetch = original;
    }
  });

  test('missing APPS_SCRIPT_URL env → 500', async () => {
    const res = await worker.fetch(
      makeFormDataRequest({
        name: 'Test',
        email: 'a@b.com',
        project: 'Other',
        message: 'Hello there please help me',
      }),
      {} // empty env
    );
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.match(body.error, /unavailable|email/i);
  });
});

describe('Locale passthrough', () => {
  test('locale field is forwarded to Apps Script', async () => {
    let capturedBody = null;
    const original = globalThis.fetch;
    globalThis.fetch = mock.fn(async (url, init) => {
      capturedBody = JSON.parse(init.body);
      return new Response(JSON.stringify({ ok: true, row: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    try {
      const res = await worker.fetch(
        makeFormDataRequest({
          name: 'Test',
          email: 'a@b.com',
          project: 'Other',
          message: 'Hello there please help me',
          locale: 'de',
        }),
        TEST_ENV
      );
      assert.equal(res.status, 200);
      assert.equal(capturedBody.locale, 'de');
    } finally {
      globalThis.fetch = original;
    }
  });

  test('missing locale defaults to "en"', async () => {
    let capturedBody = null;
    const original = globalThis.fetch;
    globalThis.fetch = mock.fn(async (url, init) => {
      capturedBody = JSON.parse(init.body);
      return new Response(JSON.stringify({ ok: true, row: 1 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    try {
      const res = await worker.fetch(
        makeFormDataRequest({
          name: 'Test',
          email: 'a@b.com',
          project: 'Other',
          message: 'Hello there please help me',
        }),
        TEST_ENV
      );
      assert.equal(res.status, 200);
      assert.equal(capturedBody.locale, 'en');
    } finally {
      globalThis.fetch = original;
    }
  });
});
