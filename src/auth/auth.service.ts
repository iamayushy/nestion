import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, AuthSigninDto } from './dto';
import jwt from "jsonwebtoken";
import * as argon from 'argon2';
@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    try {
      const hash = await argon.hash(dto.password);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });
      // save cookie in user browser
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        data: error,
      };
    }
  }
  async signin(dto: AuthSigninDto) {
    // validate password
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (user) {
      const validate = await argon.verify(user.hash, dto.password);
      if (validate) {
        return {
          success: true,
          data: user,
          message: 'auth success',
        };
      }
      return {
        success: false,
        data: {},
        message: 'invalid password',
      };
    } else {
      return {
        success: false,
        data: {},
        message: 'user not found',
      };
    }
  }
}
