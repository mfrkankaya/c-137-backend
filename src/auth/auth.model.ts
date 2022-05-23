import { Schema } from 'mongoose';

export interface User {
  firstName: string;
  lastName: string;
  avatar: string | null;
  email: string;
  password: string;
  organisationId: string | null;
  isEmailVerified: boolean;
  verificationCode: {
    code: string;
    createdAt: Date;
  };
}

export const UserSchema = new Schema<User>({
  avatar: {
    type: String,
    required: false,
    default: null,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  organisationId: {
    type: String,
    required: false,
    default: null,
  },
  isEmailVerified: {
    type: Boolean,
    required: false,
    default: false,
  },
  verificationCode: {
    type: Object,
    default: null,
  },
});

// interface Organisation {
//   id: string;
//   name: string;
//   ownerId: string;
// }
