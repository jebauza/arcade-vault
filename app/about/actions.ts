'use server';

import { Resend } from 'resend';

export type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

export type ContactFieldError = keyof ContactFormValues;

export type ContactResult =
  | { status: 'success'; name: string }
  | { status: 'invalid'; fields: ContactFieldError[] }
  | { status: 'error' };

const MAX_NAME_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 2000;
const DEFAULT_FROM_EMAIL = 'onboarding@resend.dev';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const readField = (formData: FormData, key: string): string => {
  const value = formData.get(key);
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

export async function sendContactMessage(
  formData: FormData,
): Promise<ContactResult> {
  const values: ContactFormValues = {
    name: readField(formData, 'name'),
    email: readField(formData, 'email'),
    message: readField(formData, 'message'),
  };

  // Honeypot: bots fill the hidden field. Pretend success, send nothing.
  if (readField(formData, 'website') !== '') {
    return { status: 'success', name: values.name };
  }

  const invalid = findInvalidFields(values);
  if (invalid.length > 0) {
    return { status: 'invalid', fields: invalid };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  const missing = [
    !apiKey && 'RESEND_API_KEY',
    !to && 'CONTACT_TO_EMAIL',
  ].filter(Boolean);
  if (!apiKey || !to) {
    console.error(`Contact form: missing env vars: ${missing.join(', ')}`);
    return { status: 'error' };
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
      return { status: 'error' };
    }
  } catch (cause) {
    console.error('Contact form: failed to send the email', cause);
    return { status: 'error' };
  }

  return { status: 'success', name: values.name };
}
