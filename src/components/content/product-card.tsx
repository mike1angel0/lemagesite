import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  title: string;
  image: string;
  price: number;
  slug: string;
  className?: string;
}

export function ProductCard({
  title,
  image,
  price,
  slug,
  className,
}: ProductCardProps) {
  return (
    <Link href={slug} className={cn("flex flex-col", className)}>
      <div className="relative aspect-square w-full overflow-hidden rounded">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <h3 className="mt-3 font-serif text-lg text-text-primary">{title}</h3>
      <span className="mt-1 font-serif text-xl font-bold text-gold">
        ${price.toFixed(2)}
      </span>
    </Link>
  );
}
