"use client";

import { useState, useActionState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveAboutContentAction } from "@/lib/actions/about";
import type { AuthState } from "@/lib/actions/auth";

type Collaborator = {
  name: string;
  tag: string;
  description: string;
  linkText: string;
};

const sections = [
  { id: "bio", label: "Bio" },
  { id: "cv", label: "Academic CV" },
  { id: "collaborators", label: "Collaborators" },
  { id: "support", label: "Support" },
] as const;

type SectionId = (typeof sections)[number]["id"];

interface Props {
  initialData: Record<string, string>;
}

export function AdminAboutClient({ initialData }: Props) {
  const [activeSection, setActiveSection] = useState<SectionId>("bio");
  const [saveState, saveAction, savePending] = useActionState(saveAboutContentAction, {} as AuthState);

  // Bio
  const [displayName, setDisplayName] = useState(initialData.about_displayName || "Mihai Gavrilescu");
  const [handle, setHandle] = useState(initialData.about_handle || "@lemagepoet");
  const [roles, setRoles] = useState(initialData.about_roles || "Poet · Photographer · Singer-Songwriter · AI Researcher · Former Magician");
  const [bio, setBio] = useState(initialData.about_bio || "");
  const [personalQuote, setPersonalQuote] = useState(initialData.about_personalQuote || "");

  // CV
  const [education, setEducation] = useState(initialData.about_education || "");
  const [publications, setPublications] = useState(initialData.about_publications || "");
  const [achievements, setAchievements] = useState(initialData.about_achievements || "");

  // Collaborators
  const [collaborators, setCollaborators] = useState<Collaborator[]>(() => {
    try {
      return initialData.about_collaborators ? JSON.parse(initialData.about_collaborators) : [];
    } catch {
      return [];
    }
  });

  // Support
  const [supportHeading, setSupportHeading] = useState(initialData.about_supportHeading || "");
  const [supportDescription, setSupportDescription] = useState(initialData.about_supportDescription || "");

  function updateCollaborator(index: number, field: keyof Collaborator, value: string) {
    setCollaborators((prev) => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  }
  function addCollaborator() {
    setCollaborators((prev) => [...prev, { name: "", tag: "", description: "", linkText: "" }]);
  }
  function removeCollaborator(index: number) {
    setCollaborators((prev) => prev.filter((_, i) => i !== index));
  }

  const inputClass = "w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent-dim";
  const labelClass = "font-mono text-[10px] text-text-muted tracking-[2px] uppercase block mb-1.5";
  const textareaClass = "w-full bg-bg-elevated border border-border rounded-md px-3 py-2 font-sans text-sm text-text-primary resize-none focus:outline-none focus:border-accent-dim";

  return (
    <>
      {/* Top Bar */}
      <div className="flex justify-between items-center py-6 px-8 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">About Page</h1>
        <form action={saveAction}>
          <input type="hidden" name="about_displayName" value={displayName} />
          <input type="hidden" name="about_handle" value={handle} />
          <input type="hidden" name="about_roles" value={roles} />
          <input type="hidden" name="about_bio" value={bio} />
          <input type="hidden" name="about_personalQuote" value={personalQuote} />
          <input type="hidden" name="about_education" value={education} />
          <input type="hidden" name="about_publications" value={publications} />
          <input type="hidden" name="about_achievements" value={achievements} />
          <input type="hidden" name="about_collaborators" value={JSON.stringify(collaborators)} />
          <input type="hidden" name="about_supportHeading" value={supportHeading} />
          <input type="hidden" name="about_supportDescription" value={supportDescription} />
          <button type="submit" disabled={savePending} className="inline-flex items-center gap-1.5 bg-accent text-bg font-sans text-sm rounded-md px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50">
            {savePending ? "Saving..." : saveState.success ? <><Check size={14} /> Saved</> : "Save Changes"}
          </button>
        </form>
      </div>

      {saveState.error && <div className="mx-8 mt-4 font-sans text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded px-4 py-2">{saveState.error}</div>}

      {/* Two-Column */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <div className="w-[200px] bg-bg-surface border-r border-border p-4 overflow-y-auto">
          <p className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase mb-3">Sections</p>
          <nav className="space-y-0.5">
            {sections.map((section) => (
              <button key={section.id} onClick={() => setActiveSection(section.id)} className={cn("w-full text-left py-2 px-3 rounded text-[13px] font-sans transition-colors", activeSection === section.id ? "bg-bg-elevated text-text-primary font-medium" : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated/50")}>
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 p-8 space-y-6 overflow-y-auto">
          {activeSection === "bio" && (
            <>
              <h2 className="font-sans text-[16px] font-medium text-text-primary">Bio</h2>
              <div><label className={labelClass}>Display Name</label><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Handle</label><input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Roles</label><input type="text" value={roles} onChange={(e) => setRoles(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Bio (full text)</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={10} className={textareaClass} /></div>
              <div><label className={labelClass}>Personal Quote</label><textarea value={personalQuote} onChange={(e) => setPersonalQuote(e.target.value)} rows={3} className={textareaClass} /></div>
            </>
          )}

          {activeSection === "cv" && (
            <>
              <h2 className="font-sans text-[16px] font-medium text-text-primary">Academic CV</h2>
              <div><label className={labelClass}>Education (one entry per line)</label><textarea value={education} onChange={(e) => setEducation(e.target.value)} rows={4} className={textareaClass} /></div>
              <div><label className={labelClass}>Publications (one entry per line)</label><textarea value={publications} onChange={(e) => setPublications(e.target.value)} rows={5} className={textareaClass} /></div>
              <div><label className={labelClass}>Achievements (one entry per line)</label><textarea value={achievements} onChange={(e) => setAchievements(e.target.value)} rows={6} className={textareaClass} /></div>
            </>
          )}

          {activeSection === "collaborators" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-[16px] font-medium text-text-primary">Collaborators</h2>
                <button onClick={addCollaborator} className="inline-flex items-center gap-1.5 font-sans text-sm text-accent hover:opacity-80 transition-opacity"><Plus size={14} />Add Collaborator</button>
              </div>
              {collaborators.map((collab, i) => (
                <div key={i} className="bg-bg-card border border-border rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-text-muted tracking-[2px] uppercase">Collaborator {i + 1}</span>
                    <button onClick={() => removeCollaborator(i)} className="text-text-muted hover:text-[#E57373] transition-colors"><Trash2 size={14} /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelClass}>Name</label><input type="text" value={collab.name} onChange={(e) => updateCollaborator(i, "name", e.target.value)} className={inputClass} /></div>
                    <div><label className={labelClass}>Tag</label><input type="text" value={collab.tag} onChange={(e) => updateCollaborator(i, "tag", e.target.value)} className={inputClass} /></div>
                  </div>
                  <div><label className={labelClass}>Description</label><textarea value={collab.description} onChange={(e) => updateCollaborator(i, "description", e.target.value)} rows={3} className={textareaClass} /></div>
                  <div><label className={labelClass}>Link Text</label><input type="text" value={collab.linkText} onChange={(e) => updateCollaborator(i, "linkText", e.target.value)} className={inputClass} /></div>
                </div>
              ))}
            </>
          )}

          {activeSection === "support" && (
            <>
              <h2 className="font-sans text-[16px] font-medium text-text-primary">Support Section</h2>
              <div><label className={labelClass}>Heading</label><input type="text" value={supportHeading} onChange={(e) => setSupportHeading(e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Description</label><textarea value={supportDescription} onChange={(e) => setSupportDescription(e.target.value)} rows={5} className={textareaClass} /></div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
