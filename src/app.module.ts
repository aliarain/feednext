import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { databaseService } from './shared/Config/app.config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot(databaseService.getTypeOrmConfig()),
    AuthModule,
  ],
})

export class AppModule {}
