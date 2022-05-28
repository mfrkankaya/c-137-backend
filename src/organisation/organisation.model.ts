import { Schema } from 'mongoose';

export interface Organisation {
  name: string;
  ownerId: string;
  slug: string;
}

export const OrganisationSchema = new Schema<Organisation>({
  name: {
    type: String,
    required: true,
  },
  ownerId: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
});

export interface Invitation {
  code: string;
  userId: string;
  organisationId: string;
}

export const InvitationSchema = new Schema<Invitation>({
  code: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  organisationId: {
    type: String,
    required: true,
  },
});
