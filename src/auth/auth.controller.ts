import { Controller, Post, Body, ValidationPipe, Put, Req, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, userCreated } from 'src/user/dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signUp')
  async signUp(@Body(ValidationPipe) signUpDto: CreateUserDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('/signin')
  signIn(@Body() signInDto: userCreated) {
    return this.authService.signIn(signInDto);
  }

  @Get()
  async getUserInfo(@Req() req: Request) {
    const userId = req.headers['userid'];
    return this.authService.getUserInfo(userId);
  }

  @Put('/changePassword')
  async changePassword(@Req() req: Request, @Body('password') password: string) {
    const userId = req.headers['userid'];
    return this.authService.changePassword(userId, password);
  }

  @Put('/forgotPassword')
  async forgotPassword(@Body('email') email: string, @Body('password') password: string) {
    return this.authService.forgotPassword(email, password);
  }

  @Put('/resetPasswordUsingId/:id')
  async resetPasswordUsingId(@Param("id") id: number, @Body('password') password: string) {
    return this.authService.resetPasswordUsingId(id, password);
  }

  @Post('email/changePassword')
  public async sendEmailForgotPassword(@Body('email') email: string): Promise<any> {
    const isEmailSent = await this.authService.sendEmailForgotPassword(email);
    if (isEmailSent) {
      return { message: "Mail send successfully" };
    }
  }
}