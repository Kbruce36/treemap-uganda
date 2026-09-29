import { useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarClock, CheckCircle2, Loader2, Lock, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/Layout";
import { PageHero } from "@/components/site/Brand";
import { supabase } from "@/integrations/supabase/client";
import { applicationsAreOpen, usePositions, useSiteSettings, useChapterContact } from "@/hooks/use-site";

import { STATIC_PAGES } from "@/lib/seo-core";
import { usePageMeta } from "@/lib/seo";
const schema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name").max(120),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{9,20}$/, "Enter a phone number like +256 7XX XXX XXX"),
  course: z.string().trim().min(2, "Please enter your course").max(150),
  year_of_study: z.coerce.number().int().min(1, "Choose your year of study").max(6),
  faculty: z.string().trim().max(150).optional(),
  position_id: z.string().uuid("Choose the position you are applying for"),
  motivation: z.string().trim().max(2000, "Keep it under 2,000 characters").optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Please agree so we can contact you" }) }),
});

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  course: string;
  year_of_study: string;
  faculty: string;
  position_id: string;
  motivation: string;
  consent: boolean;
};

const EMPTY: FormState = {
  full_name: "",
  email: "",
  phone: "",
  course: "",
  year_of_study: "",
  faculty: "",
  position_id: "",
  motivation: "",
  consent: false,
};

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-sm text-destructive">{message}</p> : null;

const Apply = () => {
  usePageMeta(STATIC_PAGES["/apply"]);
  const { data: settings, isLoading: settingsLoading } = useSiteSettings();
  const contact = useChapterContact();
  const { data: positions } = usePositions();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const open = applicationsAreOpen(settings);
  const openPositions = (positions ?? []).filter((p) => p.is_open);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      ...form,
      faculty: form.faculty || undefined,
      motivation: form.motivation || undefined,
    });
    if (!parsed.success) {
      const next: typeof errors = {};
      parsed.error.errors.forEach((err) => {
        const key = err.path[0] as keyof FormState;
        next[key] ??= err.message;
      });
      setErrors(next);
      toast.error("Please check the highlighted fields.");
      return;
    }

    setSubmitting(true);
    const d = parsed.data;
    const { error } = await supabase.from("executive_applications").insert({
      full_name: d.full_name!,
      email: d.email!,
      phone: d.phone!,
      course: d.course!,
      year_of_study: d.year_of_study!,
      position_id: d.position_id!,
      faculty: d.faculty ?? null,
      motivation: d.motivation ?? null,
      consent: true,
    });
    setSubmitting(false);

    if (error) {
      console.error(error);
      toast.error(
        error.code === "42501"
          ? "Applications have just closed, or that position is no longer open."
          : "We couldn't submit your application. Please try again."
      );
      return;
    }
    setSubmitted(true);
    setForm(EMPTY);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (settingsLoading) {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!open) {
    return (
      <Layout>
        <PageHero
          eyebrow="Executive applications"
          title="Applications are closed right now."
          lede="The chapter opens applications for executive positions at the end of each term. Follow us so you don't miss the next call."
        />
        <section className="container py-16">
          <div className="mx-auto max-w-2xl rounded-3xl bg-card p-8 text-center shadow-card ring-1 ring-border/60 md:p-12">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-primary">
              <Lock className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-extrabold text-primary">Not open yet</h2>
            <p className="mt-3 text-muted-foreground">
              Every position on the executive, from President to Faculty Representative, is filled through this page when
              applications open. In the meantime you can join as a member and get involved in our projects.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="bg-primary font-bold">
                <Link to="/about#join">Become a member</Link>
              </Button>
              <Button asChild variant="outline" className="font-bold">
                <a href={contact.instagram.url} target="_blank" rel="noreferrer">
                  Follow {contact.instagram.handle}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHero
        eyebrow={`${settings?.applications_title ?? "Cabinet"} · Applications open`}
        title={
          <>
            Your turn <span className="text-secondary">to lead.</span>
          </>
        }
        lede={settings?.applications_message}
        image="/images/hero/unau-group-md.jpg"
      >
        {settings?.applications_deadline && (
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-4 py-2 font-display text-sm font-bold text-primary">
            <CalendarClock className="h-4 w-4" />
            Deadline: {format(new Date(settings.applications_deadline), "EEEE d MMMM yyyy, h:mm a")}
          </p>
        )}
      </PageHero>

      <section className="container grid gap-10 py-14 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <div>
            <p className="eyebrow">Roles open</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {openPositions.map((p) => (
                <span
                  key={p.id}
                  className={`rounded-full px-4 py-2 font-display text-sm font-bold ${
                    p.title.startsWith("Faculty") ? "bg-secondary text-white" : "bg-card text-primary ring-1 ring-border"
                  }`}
                >
                  {p.title}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {openPositions.filter((p) => p.description).map((p) => (
              <div key={p.id} className="rounded-xl border-l-4 border-secondary bg-card p-4 shadow-card">
                <p className="font-display font-bold text-primary">{p.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              </div>
            ))}
          </div>
          <a
            href={contact.phoneHref}
            className="flex items-center gap-3 rounded-2xl bg-primary p-5 text-white transition hover:bg-brand-navy-deep"
          >
            <Phone className="h-5 w-5 text-secondary" />
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wider text-white/70">Questions before you apply?</span>
              <span className="font-display text-xl font-black">{contact.phone}</span>
            </span>
          </a>
        </div>

        <div className="rounded-3xl bg-card p-6 shadow-card ring-1 ring-border/60 md:p-10">
          {submitted ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-secondary" />
              <h2 className="mt-5 font-display text-3xl font-black text-primary">Application received!</h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Thank you for stepping up. The chapter will review every application and call you back on the number you
                gave us.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <Button variant="outline" onClick={() => setSubmitted(false)}>
                  Submit another
                </Button>
                <Button asChild className="bg-primary">
                  <Link to="/projects">See our projects</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div>
                <h2 className="font-display text-2xl font-black text-primary">Apply online</h2>
                <p className="mt-1 text-sm text-muted-foreground">It takes two minutes. We will call you back.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full name *</Label>
                <Input id="full_name" autoComplete="name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} aria-invalid={!!errors.full_name} />
                <FieldError message={errors.full_name} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} aria-invalid={!!errors.email} />
                  <FieldError message={errors.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number *</Label>
                  <Input id="phone" type="tel" autoComplete="tel" placeholder="+256 7XX XXX XXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone} />
                  <FieldError message={errors.phone} />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Input id="course" placeholder="e.g. Bachelor of Science in Computer Science" value={form.course} onChange={(e) => set("course", e.target.value)} aria-invalid={!!errors.course} />
                  <FieldError message={errors.course} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year of study *</Label>
                  <Select value={form.year_of_study} onValueChange={(v) => set("year_of_study", v)}>
                    <SelectTrigger id="year" aria-invalid={!!errors.year_of_study}>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          Year {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.year_of_study} />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Select value={form.position_id} onValueChange={(v) => set("position_id", v)}>
                    <SelectTrigger id="position" aria-invalid={!!errors.position_id}>
                      <SelectValue placeholder="Choose a position" />
                    </SelectTrigger>
                    <SelectContent>
                      {openPositions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.position_id} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty / school</Label>
                  <Input id="faculty" placeholder="e.g. Faculty of Engineering" value={form.faculty} onChange={(e) => set("faculty", e.target.value)} />
                  <FieldError message={errors.faculty} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation">Why do you want this role? (optional)</Label>
                <Textarea id="motivation" rows={4} maxLength={2000} value={form.motivation} onChange={(e) => set("motivation", e.target.value)} />
                <p className="text-right text-xs text-muted-foreground">{form.motivation.length}/2000</p>
                <FieldError message={errors.motivation} />
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-muted/60 p-4">
                <Checkbox id="consent" checked={form.consent} onCheckedChange={(v) => set("consent", v === true)} className="mt-0.5" />
                <Label htmlFor="consent" className="text-sm font-normal leading-relaxed text-foreground/80">
                  I agree that UNAU Kyambogo may store these details and use them to contact me about this application. They
                  are only visible to the chapter's administrators.
                </Label>
              </div>
              <FieldError message={errors.consent} />

              <Button type="submit" size="lg" disabled={submitting} className="h-12 w-full bg-primary text-base font-bold">
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                Submit application
              </Button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Apply;
