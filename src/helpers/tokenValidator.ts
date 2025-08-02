import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "../types";

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return !!decoded.exp && decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
