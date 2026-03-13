import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface EditorEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditorEditPage({ params }: EditorEditPageProps) {
  const { id } = await params;

  return (
    <>
      {/* ── Top Bar ── */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl text-text-primary">
            Edit Content
          </h1>
          <span className="font-mono text-[10px] tracking-[1px] px-2.5 py-1 rounded-full bg-starlight/10 text-starlight">
            Published
          </span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost">Save Draft</Button>
          <Button variant="filled">Publish</Button>
        </div>
      </div>

      {/* ── Two-column ── */}
      <div className="flex flex-col md:flex-row gap-8 p-8">
        {/* Editor area */}
        <div className="flex-1 space-y-6">
          <input
            type="text"
            defaultValue="The Cartographers of Silence"
            className="font-serif text-2xl text-text-primary border-b border-border pb-4 bg-transparent w-full focus:outline-none placeholder:text-text-muted"
          />
          <textarea
            defaultValue={`We drew maps of the quiet places,\ncharted the distance between one breath and the next,\nnamed the silences after constellations\nno one had seen.\n\nIn the margin of the known world,\nwe left instructions for the lost:\nfollow the sound of not-speaking,\nturn left at the pause.`}
            className="min-h-[400px] bg-bg-card border border-border rounded p-6 w-full font-sans text-sm text-text-secondary focus:outline-none placeholder:text-text-muted resize-y"
          />
        </div>

        {/* Metadata sidebar */}
        <div className="w-full md:w-[320px] space-y-6">
          {/* Category */}
          <Card padding="p-6">
            <label className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2 block">
              Category
            </label>
            <select
              defaultValue="Poetry"
              className="w-full bg-transparent border border-border text-text-primary font-sans text-sm px-4 py-3.5 focus:outline-none focus:border-accent-dim"
            >
              <option>Poetry</option>
              <option>Photography</option>
              <option>Essay</option>
              <option>Music</option>
              <option>Research</option>
            </select>
          </Card>

          {/* Membership Tier */}
          <Card padding="p-6">
            <label className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2 block">
              Membership Tier
            </label>
            <select
              defaultValue="Free"
              className="w-full bg-transparent border border-border text-text-primary font-sans text-sm px-4 py-3.5 focus:outline-none focus:border-accent-dim"
            >
              <option>Free</option>
              <option>Supporter</option>
              <option>Patron</option>
              <option>Inner Circle</option>
            </select>
          </Card>

          {/* Tags */}
          <Card padding="p-6">
            <Input
              id="tags"
              label="Tags"
              defaultValue="silence, cartography, constellations"
            />
          </Card>

          {/* Featured Image */}
          <Card padding="p-6">
            <label className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2 block">
              Featured Image
            </label>
            <div className="w-full h-[140px] border border-border rounded bg-bg-elevated flex items-center justify-center">
              <span className="font-sans text-xs text-text-muted">
                cartographers-silence.jpg
              </span>
            </div>
          </Card>

          {/* Audio / Media */}
          <Card padding="p-6">
            <label className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted mb-2 block">
              Audio / Media
            </label>
            <div className="w-full h-[80px] border border-dashed border-border rounded flex items-center justify-center">
              <span className="font-sans text-xs text-text-muted">
                Click to upload media
              </span>
            </div>
          </Card>

          {/* Schedule */}
          <Card padding="p-6">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] font-medium uppercase tracking-[2px] text-text-muted">
                Schedule Publication
              </label>
              <div className="w-10 h-5 rounded-full bg-border relative cursor-pointer">
                <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-text-muted transition-transform" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
