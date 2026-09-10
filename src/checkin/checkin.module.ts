import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}
