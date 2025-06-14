import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string | null;
    budget: number;
    income: number;
  }

  interface Session {
    user: User & {
      id: string;
      budget: number;
      income: number;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    budget: number;
    income: number;
  }
} 