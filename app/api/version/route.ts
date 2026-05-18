import { NextResponse } from 'next/server';
import { env } from '@/env';
import packageJson from '@/package.json';

export async function GET() {
  return NextResponse.json({
    name: packageJson.name,
    version: packageJson.version,
    next: packageJson.dependencies.next,
    react: packageJson.dependencies.react,
    node: process.version,
    environment: process.env.NODE_ENV ?? 'development',
    commit: process.env.VERCEL_GIT_COMMIT_SHA ?? env.GIT_COMMIT_SHA,
  });
}
