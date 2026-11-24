"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Employee, CompanySettings } from "@/lib/supabase";

type Props = {
  initialEmployees: Employee[];
  initialSettings: CompanySettings | null;
};

const emptyForm = {
  name: "",
  designation: "",
  phone: "",
  whatsapp: "",
  email: "",
  slug: "",
};

async function uploadPhoto(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload-photo", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Photo upload failed.");
  return data.photo_url as string;
}

export default function Dashboard({ initialEmployees, initialSettings }: Props) {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [settings, setSettings] = useState<CompanySettings | null>(initialSettings);
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleSignOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/card/admin");
    router.refresh();
  }

  async function handleAddEmployee(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const photo_url = photoFile ? await uploadPhoto(photoFile) : null;
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photo_url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add employee.");
      setEmployees((prev) => [data.employee, ...prev]);
      setForm(emptyForm);
      setPhotoFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(employee: Employee) {
    const res = await fetch(`/api/admin/employees/${employee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !employee.active }),
    });
    const data = await res.json();
    if (res.ok) {
      setEmployees((prev) => prev.map((e) => (e.id === employee.id ? data.employee : e)));
    }
  }

  async function saveEdit(id: string, updates: Partial<Employee>) {
    const res = await fetch(`/api/admin/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (res.ok) {
      setEmployees((prev) => prev.map((e) => (e.id === id ? data.employee : e)));
      setEditingId(null);
    } else {
      window.alert(data.error || "Could not save changes.");
    }
  }

  async function deleteEmployee(id: string) {
    if (!window.confirm("Permanently delete this card? This can't be undone.")) return;
    const res = await fetch(`/api/admin/employees/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    setSettingsError(null);
    try {
      const logo_url = logoFile ? await uploadPhoto(logoFile) : settings.logo_url;
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, logo_url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save settings.");
      setSettings(data.settings);
      setLogoFile(null);
    } catch (err) {
      setSettingsError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-paper">
          Card admin
        </h1>
        <button
          onClick={handleSignOut}
          className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm text-steel transition hover:border-steel"
        >
          Sign out
        </button>
      </div>

      {/* Company settings */}
      {settings ? (
        <section className="mt-8 rounded-2xl border border-[var(--line)] bg-ink-raised p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-blue">Company settings</h2>
          <p className="mt-1 text-xs text-steel-dim">
            The fallback contact is used on deactivated cards. The logo appears on every card -
            changing either updates the whole site instantly, no redeploy needed.
          </p>
          <form onSubmit={saveSettings} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[var(--line-strong)] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoFile ? URL.createObjectURL(logoFile) : settings.logo_url || "/zanf-logo.jpeg"}
                  alt="Current logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <Field label="Company logo">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="input file:mr-3 file:rounded-lg file:border-0 file:bg-blue-deep/40 file:px-3 file:py-1.5 file:text-paper"
                />
              </Field>
            </div>
            <Field label="Fallback phone">
              <input
                value={settings.fallback_phone}
                onChange={(e) => setSettings({ ...settings, fallback_phone: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Fallback WhatsApp">
              <input
                value={settings.fallback_whatsapp}
                onChange={(e) => setSettings({ ...settings, fallback_whatsapp: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Fallback email">
              <input
                value={settings.fallback_email || ""}
                onChange={(e) => setSettings({ ...settings, fallback_email: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Slogan">
              <input
                value={settings.slogan}
                onChange={(e) => setSettings({ ...settings, slogan: e.target.value })}
                className="input"
              />
            </Field>

            {settingsError ? <p className="sm:col-span-2 text-sm text-red-600">{settingsError}</p> : null}

            <button
              type="submit"
              disabled={savingSettings}
              className="sm:col-span-2 mt-1 w-full rounded-xl bg-gradient-to-r from-green to-blue py-2.5 text-sm font-semibold text-ink transition hover:opacity-90 disabled:opacity-60"
            >
              {savingSettings ? "Saving..." : "Save settings"}
            </button>
          </form>
        </section>
      ) : null}

      {/* Add employee */}
      <section className="mt-8 rounded-2xl border border-[var(--line)] bg-ink-raised p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-green">Add employee</h2>
        <form onSubmit={handleAddEmployee} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Name">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </Field>
          <Field label="Designation">
            <input required value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="input" />
          </Field>
          <Field label="Phone">
            <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
          </Field>
          <Field label="WhatsApp">
            <input required value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="input" />
          </Field>
          <Field label="Email (optional)">
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
          </Field>
          <Field label="Custom slug (optional)">
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto-generated from name if blank"
              className="input"
            />
          </Field>
          <Field label="Photo (optional)">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
              className="input file:mr-3 file:rounded-lg file:border-0 file:bg-blue-deep/40 file:px-3 file:py-1.5 file:text-paper"
            />
          </Field>

          {error ? <p className="sm:col-span-2 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={saving}
            className="sm:col-span-2 mt-1 w-full rounded-xl bg-gradient-to-r from-green to-blue py-2.5 text-sm font-semibold text-ink transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Adding..." : "Add employee"}
          </button>
        </form>
      </section>

      {/* Employee list */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-steel">
          Employees ({employees.length})
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              isEditing={editingId === employee.id}
              onEdit={() => setEditingId(employee.id)}
              onCancelEdit={() => setEditingId(null)}
              onSave={(updates) => saveEdit(employee.id, updates)}
              onToggleActive={() => toggleActive(employee)}
              onDelete={() => deleteEmployee(employee.id)}
            />
          ))}
          {employees.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--line)] p-6 text-center text-sm text-steel-dim">
              No employees yet. Add the first card above.
            </p>
          ) : null}
        </div>
      </section>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid var(--line-strong);
          background: transparent;
          padding: 0.65rem 1rem;
          color: var(--paper);
          outline: none;
        }
        .input:focus {
          border-color: var(--blue);
        }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-1 flex-col gap-1 text-xs font-medium uppercase tracking-wide text-steel-dim">
      {label}
      {children}
    </label>
  );
}

function EmployeeRow({
  employee,
  isEditing,
  onEdit,
  onCancelEdit,
  onSave,
  onToggleActive,
  onDelete,
}: {
  employee: Employee;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updates: Partial<Employee>) => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState(employee);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setRowError(null);
    try {
      const photo_url = photoFile ? await uploadPhoto(photoFile) : draft.photo_url;
      onSave({
        name: draft.name,
        designation: draft.designation,
        phone: draft.phone,
        whatsapp: draft.whatsapp,
        email: draft.email,
        slug: draft.slug,
        photo_url,
      });
      setPhotoFile(null);
    } catch (err) {
      setRowError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-ink-raised p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-[var(--line-strong)] bg-green-deep/10">
            {employee.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={employee.photo_url} alt={employee.name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div>
            <p className="font-medium text-paper">
              {employee.name}{" "}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  employee.active ? "bg-green-deep/15 text-green-deep" : "bg-red-100 text-red-700"
                }`}
              >
                {employee.active ? "Active" : "Deactivated"}
              </span>
            </p>
            <p className="text-sm text-steel">{employee.designation}</p>
            <a href={`/card/${employee.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-blue underline">
              vcard.zanf.org/card/{employee.slug}
            </a>
            <span className="ml-3 text-xs text-steel-dim">{employee.view_count} views</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/qr/${employee.slug}?download=1`}
            className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs text-steel transition hover:border-steel"
          >
            Download QR
          </a>
          <button onClick={onToggleActive} className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs text-steel transition hover:border-steel">
            {employee.active ? "Deactivate" : "Reactivate"}
          </button>
          <button onClick={isEditing ? onCancelEdit : onEdit} className="rounded-lg border border-[var(--line)] px-3 py-1.5 text-xs text-steel transition hover:border-steel">
            {isEditing ? "Cancel" : "Edit"}
          </button>
          <button onClick={onDelete} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 transition hover:border-red-400">
            Delete
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[var(--line)] pt-4 sm:grid-cols-2">
          <div className="sm:col-span-2 flex items-center gap-4">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[var(--line-strong)] bg-green-deep/10">
              {photoFile || draft.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoFile ? URL.createObjectURL(photoFile) : draft.photo_url || ""}
                  alt={draft.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <Field label="Photo">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="input file:mr-3 file:rounded-lg file:border-0 file:bg-blue-deep/40 file:px-3 file:py-1.5 file:text-paper"
              />
            </Field>
          </div>
          <Field label="Name">
            <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </Field>
          <Field label="Designation">
            <input className="input" value={draft.designation} onChange={(e) => setDraft({ ...draft, designation: e.target.value })} />
          </Field>
          <Field label="Phone">
            <input className="input" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} />
          </Field>
          <Field label="WhatsApp">
            <input className="input" value={draft.whatsapp} onChange={(e) => setDraft({ ...draft, whatsapp: e.target.value })} />
          </Field>
          <Field label="Email">
            <input className="input" value={draft.email || ""} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          </Field>
          <Field label="Slug">
            <input className="input" value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
          </Field>

          {rowError ? <p className="sm:col-span-2 text-sm text-red-600">{rowError}</p> : null}

          <button
            onClick={handleSave}
            disabled={saving}
            className="sm:col-span-2 rounded-xl bg-gradient-to-r from-green to-blue py-2 text-sm font-semibold text-ink transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
