import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: 'secret',
      signOptions: { expiresIn: '3h' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
  exports: [UsersService, AuthService, TypeOrmModule], // Exportez le TypeOrmModule
})
export class UsersModule {}
