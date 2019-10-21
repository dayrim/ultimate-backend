import { generateHashedPassword } from '@graphqlcqrs/common/utils';
import {AuthResponseDto} from '../dtos/response';
import {BaseEntity} from './base-entity';
import {UserEntity} from './user.entity';
import { LocalAuth } from './embeded/social';
import { Before } from '@juicycleff/nest-multi-tenant';
import { Entity } from '@juicycleff/nest-multi-tenant/database/mongo/decorators/entity.decorator';

@Entity()
export class AuthEntity extends BaseEntity<AuthResponseDto> {

  // @Column( type => LocalAuth, {})
  local: LocalAuth;

  // @Column(type => UserEntity)
  // user?: UserEntity;

  toDtoClass: new(entity: BaseEntity, options?: any) => AuthResponseDto;

  @Before('save')
  @Before('update')
  enrichName() {
    this.local.hashedPassword = generateHashedPassword(this.local.hashedPassword);
  }
}