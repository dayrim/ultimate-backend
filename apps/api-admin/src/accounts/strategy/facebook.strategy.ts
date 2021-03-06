import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-facebook';
import { AccountsService } from '../accounts.service';
import { ConsulConfig, InjectConfig } from '@nestcloud/config';
import { LoginServiceTypes, LoginRequest, CreateRequest } from '@ultimatebackend/proto-schema/account';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy) {
  logger = new Logger(this.constructor.name);

  constructor(
    @InjectConfig() private readonly config: ConsulConfig,
    private readonly accountService: AccountsService,
  ) {
    super({
      clientID: config.get<string>('app.auth.facebook.clientID'),
      clientSecret: config.get<string>('app.auth.facebook.clientSecret'),
      callbackURL: config.get<string>('app.auth.facebook.callbackURL'),
      profileFields: ['id', 'email', 'first_name', 'last_name'],
    });
  }

  async validate(accessToken, refreshToken, profile, done): Promise<any> {
    this.logger.log('accessToken', accessToken);
    console.log('profile', profile);

    if (profile && profile.emails.length > 0) {

      const logCmd: LoginRequest = {
        service: LoginServiceTypes.Facebook,
        params: {
          accessToken,
          userId: profile.id,
          email: profile.emails[0].value,
          password: undefined,
        },
      };

      const regCmd: CreateRequest = {
        service: LoginServiceTypes.Facebook,
        tokens: {
          accessToken,
          userId: profile.id,
        },
        email: profile.emails[0].value,
        firstname: profile?.name?.givenName,
        lastname: profile?.name?.familyName,
        password: undefined,
        username: undefined,
      };

      const user = await this.accountService.validateOrCreateUser(logCmd, regCmd);

      if (!user) {
        throw new UnauthorizedException();
      }
      return user;
    }
    throw new NotImplementedException();
  }
}
