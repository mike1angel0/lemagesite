import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { ReadingListClient } from "./reading-list-client";

export default async function ReadingListPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/login");

  const t = await getTranslations("readingList");

  const savedItems = await prisma.savedItem.findMany({
    where: { userId: session.user.id },
    orderBy: { savedAt: "desc" },
  });

  // Resolve titles for each saved item
  const itemsWithDetails = await Promise.all(
    savedItems.map(async (item) => {
      let title = "";
      let href = "";
      let thumbnail: string | null = null;

      switch (item.contentType) {
        case "POEM": {
          const poem = await prisma.poem.findUnique({ where: { id: item.contentId }, select: { title: true, slug: true, coverImage: true } });
          if (poem) { title = poem.title; href = `/poetry/${poem.slug}`; thumbnail = poem.coverImage; }
          break;
        }
        case "ESSAY": {
          const essay = await prisma.essay.findUnique({ where: { id: item.contentId }, select: { title: true, slug: true, thumbnail: true } });
          if (essay) { title = essay.title; href = `/essays/${essay.slug}`; thumbnail = essay.thumbnail; }
          break;
        }
        case "RESEARCH": {
          const paper = await prisma.researchPaper.findUnique({ where: { id: item.contentId }, select: { title: true, slug: true, coverImage: true } });
          if (paper) { title = paper.title; href = `/research/${paper.slug}`; thumbnail = paper.coverImage; }
          break;
        }
        case "PHOTO": {
          const photo = await prisma.photo.findUnique({ where: { id: item.contentId }, select: { title: true, slug: true, imageUrl: true } });
          if (photo) { title = photo.title; href = `/photography/${photo.slug}`; thumbnail = photo.imageUrl; }
          break;
        }
        default:
          break;
      }

      return {
        id: item.id,
        contentType: item.contentType,
        contentId: item.contentId,
        title,
        href,
        thumbnail,
        savedAt: item.savedAt.toISOString(),
      };
    })
  );

  // Filter out items whose content was deleted
  const validItems = itemsWithDetails.filter((i) => i.title);

  return (
    <section className="px-5 md:px-10 xl:px-20 py-16">
      <h1 className="font-serif text-3xl font-semibold text-text-primary mb-8">
        {t("title")}
      </h1>
      <ReadingListClient items={validItems} emptyMessage={t("empty")} progressLabel={t("progress")} />
    </section>
  );
}
