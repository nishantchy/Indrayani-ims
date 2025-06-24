import Cookies from "js-cookie";

const VALID_CREDENTIALS = {
  username: process.env.NEXT_PUBLIC_ADMIN_USER || "sayana-home",
  password: process.env.NEXT_PUBLIC_ADMIN_PASS || "password123",
};

const AUTH_COOKIE_KEY = "auth";
const EXPIRES_IN_MS = 24 * 60 * 60 * 1000; // 24 hours

export const login = (username: string, password: string) => {
  if (
    username === VALID_CREDENTIALS.username &&
    password === VALID_CREDENTIALS.password
  ) {
    const loginData = {
      isAuthenticated: true,
      loginTime: Date.now(),
      expiresIn: EXPIRES_IN_MS,
    };
    Cookies.set(AUTH_COOKIE_KEY, JSON.stringify(loginData), {
      expires: 1, // 1 day
      sameSite: "strict",
    });
    return true;
  }
  return false;
};

export const isAuthenticated = () => {
  const auth = Cookies.get(AUTH_COOKIE_KEY);
  if (!auth) return false;
  try {
    const { isAuthenticated, loginTime, expiresIn } = JSON.parse(auth);
    const isExpired = Date.now() - loginTime > expiresIn;
    if (isExpired) {
      Cookies.remove(AUTH_COOKIE_KEY);
      return false;
    }
    return isAuthenticated;
  } catch {
    Cookies.remove(AUTH_COOKIE_KEY);
    return false;
  }
};

export const logout = () => {
  Cookies.remove(AUTH_COOKIE_KEY);
};
