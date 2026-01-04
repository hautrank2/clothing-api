import { JwtPayload } from './auth';

declare global {
  interface Request {
    user?: JwtPayload;
  }
}
