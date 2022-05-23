import { Document } from 'mongoose';
import * as Yup from 'yup';
import { User } from './auth.model';

export const emailYup = Yup.string().email().required();
export const passwordYup = Yup.string().max(32).min(8).required();

export const getUserSecureDetails = ({
  id,
  email,
  firstName,
  lastName,
  organisationId,
  avatar,
  isEmailVerified,
}: Document<unknown, any, User> & User) => ({
  id,
  email,
  firstName,
  lastName,
  organisationId,
  avatar,
  isEmailVerified,
});
