import {handleAuth} from "@kinde-oss/kinde-auth-nextjs/server";

const redirectConfig = process.env.VERCEL_URL ? {
  postLoginRedirectURL: `https://${process.env.VERCEL_URL}`,
  postLogoutRedirectURL: `https://${process.env.VERCEL_URL}`
} : {};

export const GET = handleAuth(redirectConfig);