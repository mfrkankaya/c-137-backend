import { Body, Controller, Headers, Post } from '@nestjs/common';
import { OrganisationService } from './organisation.service';

@Controller('organisation')
export class OrganisationController {
  constructor(private readonly organisationService: OrganisationService) {}

  @Post('create')
  createOrganisation(
    @Body('name') name: string,
    @Body('slug') slug: string,
    @Headers('authorization') token: string,
  ) {
    return this.organisationService.createOrganisation({ name, token, slug });
  }
}
