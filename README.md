# ✨ IDK. URL Shortener

A modern, feature-rich URL shortener built with Next.js 14. Create short, memorable links with password protection, expiry dates, and real-time analytics. **Completely self-hostable, SQLite compatible, and lightning fast!**

![URL Shortener Preview](https://i.imgur.com/placeholder.png)

## ✨ Features

- 🔒 **Password Protection**: Secure sensitive links with password protection
- ⏱️ **Expiry Dates**: Set custom expiration dates for your links
- 📊 **Real-time Analytics**: Track clicks and monitor link performance
- 🔍 **URL Health Checks**: Verify links are accessible before shortening
- 📱 **QR Code Generation**: Generate QR codes for easy sharing
- 🌓 **Dark/Light Mode**: Beautiful UI with theme support
- 🎨 **Modern Design**: Clean, responsive interface with smooth animations
- 🚀 **Lightning Fast**: Optimized for performance with minimal dependencies
- 💾 **SQLite Support**: Works out of the box with SQLite for easy self-hosting
- 🏠 **Self-hostable**: Deploy anywhere - your server, VPS, or cloud platform

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and Bun 1.0+

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/url-shortener.git
   cd url-shortener
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your database credentials and other configuration.

4. Set up the database:
   ```bash
   # For SQLite (default, no additional setup needed)
   bunx prisma db push

   # For PostgreSQL/MySQL
   # Update DATABASE_URL in .env.local first
   bunx prisma db push
   ```

5. Start the development server:
   ```bash
   bun dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see your URL shortener in action!

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Prisma](https://www.prisma.io/) with SQLite/PostgreSQL/MySQL support
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **QR Codes**: [qrcode.react](https://github.com/zpao/qrcode.react)

## 🔧 Configuration

The application can be configured through environment variables:

```env
# Database (choose one)
DATABASE_URL="file:./dev.db"  # SQLite
# DATABASE_URL="postgresql://..."  # PostgreSQL
# DATABASE_URL="mysql://..."  # MySQL

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

## 🚀 Deployment

This application is designed to be easily self-hosted:

- **VPS**: Deploy on any VPS provider (DigitalOcean, Linode, etc.)
- **Docker**: Coming soon!
- **Cloud**: Deploy on any cloud platform (AWS, GCP, Azure)
- **Shared Hosting**: Works on any hosting that supports Node.js

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Vercel](https://vercel.com) for the deployment platform
