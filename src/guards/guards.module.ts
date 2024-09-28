import { Global, Module } from '@nestjs/common';
import { AccessTokenGuard } from './access-token.guard';
import { RefreshTokenGuard } from './refresh-token.guard';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [UserModule],
  providers: [AccessTokenGuard, RefreshTokenGuard],
  exports: [AccessTokenGuard, RefreshTokenGuard, UserModule],
})
export class GuardsModule {}
