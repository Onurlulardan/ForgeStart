import type { Metadata } from 'next';
import './globals.css';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { Layout } from 'antd';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'NextJS Starter',
  description: 'Modern Next.js, Auth.js, Drizzle, PostgreSQL starter template',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <Providers>
            <Layout>{children}</Layout>
          </Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
