export interface IdentifyRequest {
  email?: string;
  phoneNumber?: string;
}

export interface ContactResponse {
  contact: {
    primaryContatctId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

export type { Contact } from '@prisma/client';
