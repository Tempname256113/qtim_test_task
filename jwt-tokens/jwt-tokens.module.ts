import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtTokensService } from './jwt-tokens.service';

@Global()
@Module({
  imports: [JwtModule],
  providers: [JwtTokensService],
  exports: [JwtTokensService],
})
export class JwtTokensModule {}
