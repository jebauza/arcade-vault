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
