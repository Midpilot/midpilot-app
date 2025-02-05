import {handleAuth} from "@kinde-oss/kinde-auth-nextjs/server";

const redirectConfig = process.env.VERCEL_URL && process.env.NODE_ENV === 'development' ? {
  postLoginRedirectURL: `https://${process.env.VERCEL_URL}`,
  postLogoutRedirectURL: `https://${process.env.VERCEL_URL}`
} : {};

console.log("Node env: ", process.env.NODE_ENV);
console.log("Vercel URL: ", process.env.VERCEL_URL);
console.log("Redirect config:", redirectConfig);

export const GET = handleAuth(redirectConfig);
