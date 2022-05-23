import { Schema } from 'mongoose';
import { boolean } from 'yup';

export interface User {
  firstName: string;
  lastName: string;
  avatar: string | null;
  email: string;
  password: string;
  organisationId: string | null;
  isEmailVerified: boolean;
}

export const UserSchema = new Schema<User>({
  avatar: {
    type: String,
    required: false,
    default: 'https://picsum.photos/256',
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
  },
  isEmailVerified: {
    type: Boolean,
    required: false,
    default: false,
  },
});

// interface Organisation {
//   id: string;
//   name: string;
//   ownerId: string;
// }
