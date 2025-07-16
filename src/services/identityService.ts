import prisma from '../utils/database';
import { Contact, ContactResponse } from '../types';

export class IdentityService {
  async identifyContact(email?: string, phoneNumber?: string): Promise<ContactResponse> {
    if (!email && !phoneNumber) {
      throw new Error('At least one of email or phoneNumber must be provided');
    }

    const existingContacts = await this.findMatchingContacts(email, phoneNumber);
    
    if (existingContacts.length === 0) {
      return this.createNewPrimaryContact(email, phoneNumber);
    }

    const exactMatch = existingContacts.find(contact => 
      contact.email === email && contact.phoneNumber === phoneNumber
    );

    if (exactMatch) {
      return this.buildContactResponse(exactMatch);
    }

    const primaryContacts = existingContacts.filter(c => c.linkPrecedence === 'primary');
    
    if (primaryContacts.length > 1) {
      await this.linkPrimaryContacts(primaryContacts);
      await this.createSecondaryContact(primaryContacts[0].id, email, phoneNumber);
      return this.buildContactResponse(primaryContacts[0]);
    }

    const primaryContact = await this.findPrimaryContact(existingContacts[0]);
    
    const hasNewEmail = email && !existingContacts.some(c => c.email === email);
    const hasNewPhone = phoneNumber && !existingContacts.some(c => c.phoneNumber === phoneNumber);
    
    if (hasNewEmail || hasNewPhone) {
      await this.createSecondaryContact(primaryContact.id, email, phoneNumber);
    }

    return this.buildContactResponse(primaryContact);
  }

  private async findMatchingContacts(email?: string, phoneNumber?: string): Promise<Contact[]> {
    const whereConditions = [];
    
    if (email) {
      whereConditions.push({ email });
    }
    
    if (phoneNumber) {
      whereConditions.push({ phoneNumber });
    }

    const contacts = await prisma.contact.findMany({
      where: {
        OR: whereConditions,
        deletedAt: null
      },
      orderBy: { createdAt: 'asc' }
    });

    return contacts;
  }

  private async createNewPrimaryContact(email?: string, phoneNumber?: string): Promise<ContactResponse> {
    const newContact = await prisma.contact.create({
      data: {
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkPrecedence: 'primary',
        linkedId: null
      }
    });

    return {
      contact: {
        primaryContatctId: newContact.id,
        emails: newContact.email ? [newContact.email] : [],
        phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
        secondaryContactIds: []
      }
    };
  }

  private async createSecondaryContact(primaryId: number, email?: string, phoneNumber?: string): Promise<Contact> {
    return await prisma.contact.create({
      data: {
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkPrecedence: 'secondary',
        linkedId: primaryId
      }
    });
  }

  private async linkPrimaryContacts(primaryContacts: Contact[]): Promise<void> {
    primaryContacts.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const oldestPrimary = primaryContacts[0];

    for (let i = 1; i < primaryContacts.length; i++) {
      const contactToUpdate = primaryContacts[i];
      
      await prisma.contact.update({
        where: { id: contactToUpdate.id },
        data: {
          linkPrecedence: 'secondary',
          linkedId: oldestPrimary.id
        }
      });

      await prisma.contact.updateMany({
        where: { linkedId: contactToUpdate.id },
        data: { linkedId: oldestPrimary.id }
      });
    }
  }

  private async findPrimaryContact(contact: Contact): Promise<Contact> {
    if (contact.linkPrecedence === 'primary') {
      return contact;
    }

    if (contact.linkedId) {
      const linkedContact = await prisma.contact.findUnique({
        where: { id: contact.linkedId }
      });
      
      if (linkedContact) {
        return this.findPrimaryContact(linkedContact);
      }
    }

    throw new Error('Could not find primary contact');
  }

  private async buildContactResponse(primaryContact: Contact): Promise<ContactResponse> {
    const allLinkedContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryContact.id },
          { linkedId: primaryContact.id }
        ],
        deletedAt: null
      },
      orderBy: { createdAt: 'asc' }
    });

    const primary = allLinkedContacts.find(c => c.linkPrecedence === 'primary');
    const secondaries = allLinkedContacts.filter(c => c.linkPrecedence === 'secondary');

    if (!primary) {
      throw new Error('Primary contact not found');
    }

    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();

    if (primary.email) emails.add(primary.email);
    if (primary.phoneNumber) phoneNumbers.add(primary.phoneNumber);

    secondaries.forEach(contact => {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
    });

    return {
      contact: {
        primaryContatctId: primary.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds: secondaries.map(c => c.id)
      }
    };
  }
}