import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/auth/auth.model';
import { AuthService } from 'src/auth/auth.service';
import {
  createErrorResponse,
  createSuccessResponse,
  generateSixDigitsCode,
} from 'src/common/utils';
import { CreateOrganisationDTO, InviteUserDTO } from './organisation.dto';
import { Invitation, Organisation } from './organisation.model';

@Injectable()
export class OrganisationService {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    @InjectModel('Organisation')
    private readonly organisationModel: Model<Organisation>,
    @InjectModel('User')
    private readonly userModel: Model<User>,
    @InjectModel('Invitation')
    private readonly invitationModel: Model<Invitation>,
  ) {}

  async createOrganisation({ name, token, slug }: CreateOrganisationDTO) {
    if (!name) return createErrorResponse('name-required');
    if (!slug) return createErrorResponse('slug-required');
    if (!token) return createErrorResponse('token-required');

    try {
      const { userId } = await this.jwtService.verifyAsync<JwtData>(token, {
        secret: process.env.JWT_SECRET,
      });

      const { success, data } = await this.authService.getUserDetails(token);
      if (!success) return createErrorResponse('user-not-found');

      if (!data.user.isEmailVerified)
        return createErrorResponse('email-not-verified');

      if (data.user.organisationId)
        return createErrorResponse('already-has-organisation');

      const isSlugExist = await this.organisationModel.findOne({ slug });
      if (isSlugExist) return createErrorResponse('slug-already-exist');

      const organisation = new this.organisationModel({
        name,
        slug,
        ownerId: userId,
      });

      await Promise.all([
        organisation.save(),
        this.userModel.findByIdAndUpdate(userId, {
          organisationId: organisation.id,
        }),
      ]);

      return createSuccessResponse({
        organisation: { id: organisation.id, name, slug, ownerId: userId },
      });
    } catch (error) {
      if (error.message === 'invalid token')
        return createErrorResponse('invalid-token');
      return createErrorResponse('unknown-error');
    }
  }

  async inviteUser({ email, token }: InviteUserDTO) {
    if (!email) return createErrorResponse('email-required');
    if (!token) return createErrorResponse('token-required');

    try {
      const targetUser = await this.userModel.findOne({ email });
      if (!targetUser) return createErrorResponse('email-not-found');

      const { success, data } = await this.authService.getUserDetails(token);
      if (!success) return createErrorResponse('unauthorized');
      const {
        user: { organisationId, id: userId },
      } = data;

      if (!organisationId) return createErrorResponse('organisation-not-found');

      const organisation = await this.organisationModel.findById(
        organisationId,
      );

      if (!organisation) return createErrorResponse('organisation-not-found');
      if (organisation.ownerId !== userId)
        return createErrorResponse('user-is-not-owner');

      // const { code } = generateSixDigitsCode();

      // const invitation = new this.invitationModel({
      //   userId,
      //   organisationId,
      //   code,
      // });

      return createSuccessResponse(null);
    } catch (error) {
      if (error.message === 'invalid token')
        return createErrorResponse('invalid-token');
      return createErrorResponse('unknown-error');
    }
  }
}
