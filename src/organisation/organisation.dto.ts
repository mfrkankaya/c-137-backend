export interface CreateOrganisationDTO {
  name: string;
  token: string;
  slug: string;
}

export interface InviteUserDTO {
  email: string;
  token: string;
}
