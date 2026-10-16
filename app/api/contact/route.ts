import { Resend } from 'resend';
import type {
  ContactFieldError,
  ContactFormValues,
  ContactResult,
} from './types';

const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 2000;
const DEFAULT_FROM_EMAIL = 'onboarding@resend.dev';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const respond = (result: ContactResult, status: number): Response =>
  Response.json(result, { status });

const readBody = async (
  request: Request,
): Promise<Record<string, unknown>> => {
  try {
    const body: unknown = await request.json();
    return typeof body === 'object' && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const readField = (body: Record<string, unknown>, key: string): string => {
  const value = body[key];
  return typeof value === 'string' ? value.trim() : '';
};

const findInvalidFields = (values: ContactFormValues): ContactFieldError[] => {
  const invalid: ContactFieldError[] = [];
  if (!values.name || values.name.length > MAX_NAME_LENGTH) {
    invalid.push('name');
  }
  if (!EMAIL_PATTERN.test(values.email)) {
    invalid.push('email');
  }
  if (!values.message || values.message.length > MAX_MESSAGE_LENGTH) {
    invalid.push('message');
  }
  return invalid;
};

export async function POST(request: Request): Promise<Response> {
  const body = await readBody(request);
  const values: ContactFormValues = {
    name: readField(body, 'name'),
    email: readField(body, 'email'),
    message: readField(body, 'message'),
  };

  // Honeypot: bots fill the hidden field. Pretend success, send nothing.
  if (readField(body, 'website') !== '') {
    return respond({ status: 'success', name: values.name }, 200);
  }

  const invalid = findInvalidFields(values);
  if (invalid.length > 0) {
    return respond({ status: 'invalid', fields: invalid }, 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  if (!apiKey || !to) {
    const missing = [!apiKey && 'RESEND_API_KEY', !to && 'CONTACT_TO_EMAIL'];
    console.error(
      `Contact form: missing env vars: ${missing.filter(Boolean).join(', ')}`,
    );
    return respond({ status: 'error' }, 500);
  }

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: values.email,
      subject: `[Arcade Vault] Mensaje de ${values.name}`,
      text: `Nombre: ${values.name}\nCorreo: ${values.email}\n\n${values.message}`,
    });
    if (error) {
      console.error('Contact form: Resend rejected the email', error);
      return respond({ status: 'error' }, 500);
    }
  } catch (cause) {
    console.error('Contact form: failed to send the email', cause);
    return respond({ status: 'error' }, 500);
  }

  return respond({ status: 'success', name: values.name }, 200);
}
