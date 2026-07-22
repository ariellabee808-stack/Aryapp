import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

// Scopes we requested in OAuth
const GMAIL_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels'
];

GMAIL_SCOPES.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If we have a user but no cached token (e.g. page refresh),
        // we'll trigger login window or let components know they need to re-auth
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Start Google sign-in flow
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(provider.setCustomParameters({ prompt: 'select_account' }) ? auth : auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to extract Google access token from Firebase Authentication.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// --- GMAIL API WRAPPERS ---

export interface GmailEmail {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  htmlBody?: string;
  labels: string[];
  isUnread: boolean;
}

// Utility to decode base64url string to unicode string
export function decodeBase64Url(str: string): string {
  if (!str) return '';
  try {
    // Replace non-url compat characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '='
    while (base64.length % 4) {
      base64 += '=';
    }
    const raw = atob(base64);
    // Decode UTF-8 bytes to string
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.error('Base64 decode error:', e);
    return 'Error decoding message body.';
  }
}

// Recursively traverse payload parts to retrieve text/plain and text/html body parts
function extractBodyParts(payload: any): { text: string; html: string } {
  let text = '';
  let html = '';

  if (!payload) return { text, html };

  if (payload.body && payload.body.data) {
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/plain') {
      text = decoded;
    } else if (payload.mimeType === 'text/html') {
      html = decoded;
    }
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const extracted = extractBodyParts(part);
      if (extracted.text) text += (text ? '\n' : '') + extracted.text;
      if (extracted.html) html += (html ? '\n' : '') + extracted.html;
    }
  }

  return { text, html };
}

// Helper to extract specific header value
function getHeaderValue(headers: any[], name: string): string {
  if (!headers) return '';
  const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
  return header ? header.value : '';
}

// Fetch list of message metadata
export const fetchEmailsList = async (
  token: string, 
  query: string = '', 
  maxResults: number = 20,
  pageToken?: string
): Promise<{ emails: GmailEmail[]; nextPageToken?: string }> => {
  let url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`;
  if (query) url += `&q=${encodeURIComponent(query)}`;
  if (pageToken) url += `&pageToken=${pageToken}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Gmail API failure: ${response.statusText}`);
  }

  const data = await response.ok ? await response.json() : {};
  if (!data.messages || data.messages.length === 0) {
    return { emails: [], nextPageToken: data.nextPageToken };
  }

  // Fetch full details of each message in parallel
  const detailPromises = data.messages.map(async (msg: any) => {
    try {
      const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!detailRes.ok) return null;
      const detail = await detailRes.json();

      const headers = detail.payload?.headers || [];
      const subject = getHeaderValue(headers, 'subject') || '(No Subject)';
      const from = getHeaderValue(headers, 'from') || 'Unknown Sender';
      const to = getHeaderValue(headers, 'to') || '';
      const dateStr = getHeaderValue(headers, 'date') || '';
      
      const { text, html } = extractBodyParts(detail.payload);
      const labels = detail.labelIds || [];
      const isUnread = labels.includes('UNREAD');

      return {
        id: detail.id,
        threadId: detail.threadId,
        snippet: detail.snippet || '',
        subject,
        from,
        to,
        date: dateStr,
        body: text || detail.snippet || '',
        htmlBody: html || undefined,
        labels,
        isUnread
      } as GmailEmail;
    } catch (err) {
      console.error(`Error loading email ${msg.id}:`, err);
      return null;
    }
  });

  const resolved = await Promise.all(detailPromises);
  const emails = resolved.filter((e): e is GmailEmail => e !== null);

  return { emails, nextPageToken: data.nextPageToken };
};

// Mark an email as read
export const markAsRead = async (token: string, messageId: string): Promise<void> => {
  await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      removeLabelIds: ['UNREAD']
    })
  });
};

// Trash an email
export const trashEmail = async (token: string, messageId: string): Promise<void> => {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/trash`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    throw new Error(`Failed to trash message: ${response.statusText}`);
  }
};

// Send an email
export const sendGmailEmail = async (
  token: string,
  to: string,
  subject: string,
  body: string
): Promise<any> => {
  // Construct raw RFC 822 formatted email message
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body.replace(/\n/g, '<br/>')
  ];
  const message = messageParts.join('\r\n');

  // Base64url encode the entire email raw
  const encodedEmail = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: encodedEmail
    })
  });

  if (!response.ok) {
    throw new Error(`Gmail Send API failure: ${response.statusText}`);
  }

  return response.json();
};

// Create a Draft email
export const createGmailDraft = async (
  token: string,
  to: string,
  subject: string,
  body: string
): Promise<any> => {
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
  const messageParts = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body.replace(/\n/g, '<br/>')
  ];
  const message = messageParts.join('\r\n');

  const encodedEmail = btoa(unescape(encodeURIComponent(message)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: {
        raw: encodedEmail
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gmail Draft API failure: ${response.statusText}`);
  }

  return response.json();
};
