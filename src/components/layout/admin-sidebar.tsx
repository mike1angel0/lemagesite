"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  User,
  Users,
  TrendingUp,
  Mail,
  BookOpen,
  Handshake,
  Quote,
  Settings,
  Globe,
  Calendar,
  ShoppingCart,
  Image as ImageIcon,
  Search,
  Palette,
  MessageSquare,
  PenLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { key: "content", href: "/admin/content", icon: FileText, label: "Content" },
  { key: "about", href: "/admin/about", icon: User, label: "About" },
  { key: "messages", href: "/admin/messages", icon: MessageSquare, label: "Messages" },
  { key: "members", href: "/admin/members", icon: Users, label: "Members" },
  { key: "analytics", href: "/admin/analytics", icon: TrendingUp, label: "Analytics" },
  { key: "newsletter", href: "/admin/newsletter", icon: Mail, label: "Newsletter" },
  { key: "scriptorium", href: "/admin/scriptorium", icon: BookOpen, label: "Scriptorium" },
  { key: "partnerships", href: "/admin/partnerships", icon: Handshake, label: "Partnerships" },
  { key: "quotes", href: "/admin/quotes", icon: Quote, label: "Quotes" },
  { key: "events", href: "/admin/events", icon: Calendar, label: "Events" },
  { key: "orders", href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { key: "media", href: "/admin/media", icon: ImageIcon, label: "Media Library" },
  { key: "page-content", href: "/admin/page-content", icon: PenLine, label: "Page Content" },
  { key: "designs", href: "/admin/designs", icon: Palette, label: "Designs" },
  { key: "seo", href: "/admin/seo", icon: Search, label: "SEO" },
  { key: "settings", href: "/admin/settings", icon: Settings, label: "Settings" },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const localePrefix = locale === "ro" ? "" : `/${locale}`;

  function isActive(href: string) {
    const fullHref = `${localePrefix}${href}`;
    if (href === "/admin") {
      return pathname === fullHref || pathname === `${localePrefix}/admin/`;
    }
    return pathname.startsWith(fullHref);
  }

  return (
    <aside className="w-60 min-h-screen bg-bg-surface border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-border">
        <Link href={`${localePrefix}/admin`}>
          <Image
            src="/logo.png"
            alt="Selenarium"
            width={160}
            height={76}
            className="h-[80px] w-auto"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col py-4 flex-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.key}
              href={`${localePrefix}${item.href}`}
              className={cn(
                "flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-sans transition-colors",
                active
                  ? "bg-bg-elevated text-text-primary font-medium"
                  : "text-text-secondary hover:bg-bg-elevated/50 hover:text-text-primary"
              )}
            >
              <Icon
                size={16}
                className={cn(
                  active ? "text-accent" : "text-text-muted"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* View Site link */}
        <Link
          href={`${localePrefix}/`}
          className="flex items-center gap-2.5 px-5 py-2.5 text-[13px] font-sans text-accent-dim hover:text-text-secondary transition-colors"
        >
          <Globe size={16} className="text-text-muted" />
          <span>View Site →</span>
        </Link>
      </nav>
    </aside>
  );
}
