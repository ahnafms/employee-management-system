import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/common/utils/envConfig";

interface JwtPayloadWithRoles {
  email?: string;
  roles?: string[];
  [key: string]: unknown;
}

const authenticateJWT: RequestHandler = (req, res, next) => {
  try {
    let token: string | undefined;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      token = req.cookies[env.JWT_COOKIE_NAME];
    }

    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayloadWithRoles;

    (req as any).user = decoded;

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const authorizeAdmin: RequestHandler = (req, res, next) => {
  const user = (req as any).user as JwtPayloadWithRoles | undefined;

  if (!user || !Array.isArray(user.roles)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }

  if (!user.roles.includes("admin")) {
    return res.status(403).json({ message: "Forbidden: admin role required" });
  }

  return next();
};

export { authenticateJWT, authorizeAdmin };
