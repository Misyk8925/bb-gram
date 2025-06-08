import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import { Observable } from 'rxjs';
import {SupabaseService} from "../supabase/supabase.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {
  }
  async canActivate(
    context: ExecutionContext,
  ) :Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader){
      throw new UnauthorizedException('No auth header provided')
    }

    const token = authHeader.split(' ') [1]

    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    try{
      const {data, error} = await this.supabaseService
          .getClient()
          .auth.getUser(token)

      if (error) {
        throw new UnauthorizedException(error.message)
      }

      request.user = data.user

      return true

    }
    catch (e) {
      throw new UnauthorizedException(e.message)
    }
  }
}
