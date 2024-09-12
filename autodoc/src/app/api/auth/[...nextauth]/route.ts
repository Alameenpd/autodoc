// src/app/api/auth/[...nextauth]/route.ts

import { handler } from "@/lib/auth";

// Export handlers for GET and POST methods
export const GET = handler;
export const POST = handler;
