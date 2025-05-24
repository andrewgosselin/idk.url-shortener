import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { PasswordPrompt } from '@/components/password-prompt';
import { ErrorPage } from '@/components/error-page';
import bcrypt from 'bcryptjs';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function RedirectPage({ params }: PageProps) {
  const { slug } = params;
  const cookieStore = await cookies();

  const shortUrl = await prisma.shortUrl.findUnique({
    where: { slug },
  });

  if (!shortUrl) {
    return <ErrorPage title="URL Not Found" message="The short URL you're looking for doesn't exist." />;
  }

  // Check if URL has expired
  if (shortUrl.expiresAt && new Date(shortUrl.expiresAt) < new Date()) {
    return <ErrorPage title="URL Expired" message="This short URL has expired." />;
  }

  // Check if URL is password protected
  if (shortUrl.password) {
    const storedPassword = cookieStore.get('password_' + slug)?.value;
    
    if (!storedPassword) {
      return (
        <html>
          <body>
            <PasswordPrompt slug={slug} />
          </body>
        </html>
      );
    }

    // Verify the stored password
    const isValid = await bcrypt.compare(storedPassword, shortUrl.password);
    if (!isValid) {
      // Clear the invalid cookie
      const response = new Response('Invalid password', { status: 401 });
      response.headers.set('Set-Cookie', `password_${slug}=; Path=/; Max-Age=0`);
      return <ErrorPage title="Invalid Password" message="The password you entered is incorrect." />;
    }
  }

  // Increment click count
  await prisma.shortUrl.update({
    where: { slug },
    data: { clicks: { increment: 1 } },
  });

  // Redirect to the destination URL
  redirect(shortUrl.url);
} 