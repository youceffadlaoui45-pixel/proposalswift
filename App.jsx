import { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard,
  Plus,
  Sun,
  Moon,
  DollarSign,
  Clock,
  FileSignature,
  Eye,
  Sparkles,
  Loader2,
  X,
  Building2,
  Mail,
  User,
  Calendar,
  Percent,
  Check,
  Copy,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Bell,
  ChevronRight,
  Briefcase,
  Wallet,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock data & helpers                                                */
/* ------------------------------------------------------------------ */

const STATUS_STYLES = {
  Draft:  { light: "bg-slate-100 text-slate-600",  dark: "bg-slate-800 text-slate-300",  dot: "bg-slate-400" },
  Sent:   { light: "bg-indigo-50 text-indigo-700", dark: "bg-indigo-500/15 text-indigo-300", dot: "bg-indigo-500" },
  Viewed: { light: "bg-amber-50 text-amber-700",   dark: "bg-amber-500/15 text-amber-300", dot: "bg-amber-500" },
  Signed: { light: "bg-violet-50 text-violet-700", dark: "bg-violet-500/15 text-violet-300", dot: "bg-violet-500" },
  Paid:   { light: "bg-emerald-50 text-emerald-700", dark: "bg-emerald-500/15 text-emerald-300", dot: "bg-emerald-500" },
};

const SECTION_ORDER = [
  ["executiveSummary", "Executive Summary"],
  ["scopeOfWork", "Scope of Work"],
  ["deliverables", "Deliverables"],
  ["timeline", "Timeline"],
  ["financialInvestment", "Financial Investment"],
  ["terms", "Terms"],
];

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(amount || 0);
  } catch {
    return `${currency || "USD"} ${amount || 0}`;
  }
}

function formatDate(d) {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Deterministic, no-API fallback proposal writer. Used if the AI call fails,
// and also used to seed the mock dashboard data so every demo row is fully explorable.
function buildFallbackContent(f) {
  const dep = Number(f.deposit) || 30;
  const price = Number(f.price) || 0;
  const depositAmt = Math.round((price * dep) / 100);
  const remaining = price - depositAmt;
  const notes = (f.notes || "a focused, high-quality engagement").trim();

  return {
    executiveSummary:
      `${f.company || "Your team"} is looking for a partner to deliver ${f.service || "this project"} with clarity, speed, and craft. ` +
      `Based on our conversation, this proposal outlines exactly how I'll approach the work, what you'll receive, and when. ` +
      `My goal is straightforward: a result you're proud to put your name on, delivered on a timeline you can plan around.`,
    scopeOfWork:
      `This engagement covers ${f.service || "the agreed scope"}, built around the brief you shared:\n` +
      `• ${notes}\n` +
      `• Regular check-ins so there are no surprises along the way\n` +
      `• One structured revision round included before final delivery`,
    deliverables:
      `• A complete, production-ready ${f.service || "deliverable"}\n` +
      `• Source files and any relevant assets, handed over in editable formats\n` +
      `• A short handover walkthrough so your team can take it from here`,
    timeline:
      `Work begins on signature and kicks off with a brief kickoff call. Target completion is ${formatDate(f.deadline) || "to be confirmed together"}. ` +
      `I'll flag early if anything puts that date at risk — no last-minute surprises.`,
    financialInvestment:
      `Total project investment: ${formatMoney(price, f.currency)}.\n` +
      `• Deposit to begin (${dep}%): ${formatMoney(depositAmt, f.currency)}, due on signature\n` +
      `• Remaining balance: ${formatMoney(remaining, f.currency)}, due on completion`,
    terms:
      `This proposal is valid for 14 days from the date sent. The deposit reserves my schedule and confirms the start date. ` +
      `Ownership of final deliverables transfers upon receipt of full payment. Additional requests outside this scope will be quoted separately.`,
  };
}

function seedProposal(over) {
  const base = {
    clientEmail: "client@example.com",
    company: "Client Co.",
    service: "Web Design",
    notes: "Redesign of the marketing site, 5 pages, mobile-first.",
    deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
    price: 4200,
    currency: "USD",
    deposit: 30,
  };
  const f = { ...base, ...over };
  return {
    id: over.id,
    clientName: f.clientName,
    clientEmail: f.clientEmail,
    company: f.company,
    service: f.service,
    notes: f.notes,
    deadline: f.deadline,
    price: f.price,
    currency: f.currency,
    deposit: f.deposit,
    status: over.status,
    createdAt: over.createdAt,
    viewedAt: over.viewedAt || null,
    signedAt: over.signedAt || null,
    paidAt: over.paidAt || null,
    signature: over.signature || null,
    content: buildFallbackContent(f),
  };
}

const initialProposals = [
  seedProposal({ id: "p1", clientName: "Maren Voss", company: "Northlane Studio", service: "Brand Identity", price: 3200, currency: "EUR", deposit: 40, status: "Paid", createdAt: "2026-08-02", viewedAt: "2026-08-03", signedAt: "2026-08-04", paidAt: "2026-08-04" }),
  seedProposal({ id: "p2", clientName: "Diego Fuentes", company: "Fuentes & Cole Law", service: "Website Copywriting", price: 1800, currency: "USD", deposit: 50, status: "Signed", createdAt: "2026-08-20", viewedAt: "2026-08-21", signedAt: "2026-08-22" }),
  seedProposal({ id: "p3", clientName: "Ava Chen", company: "Lumen Retail", service: "E-commerce Web Design", price: 6500, currency: "USD", deposit: 30, status: "Viewed", createdAt: "2026-08-28", viewedAt: "2026-08-29" }),
  seedProposal({ id: "p4", clientName: "Tomas Berg", company: "Berg Consulting", service: "SEO Audit & Strategy", price: 2100, currency: "EUR", deposit: 25, status: "Sent", createdAt: "2026-09-02" }),
  seedProposal({ id: "p5", clientName: "Priya Nair", company: "Willow & Co.", service: "Social Media Design", price: 950, currency: "USD", deposit: 50, status: "Draft", createdAt: "2026-09-05" }),
];

const emptyForm = {
  clientName: "",
  clientEmail: "",
  company: "",
  service: "",
  notes: "",
  deadline: "",
  price: "",
  currency: "USD",
  deposit: 30,
};

/* ------------------------------------------------------------------ */
/*  Small shared UI pieces                                             */
/* ------------------------------------------------------------------ */

function StatusPill({ status, dark }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Draft;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium font-sans ${dark ? s.dark : s.light}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function AutoTextarea({ value, onChange, className, placeholder }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={2}
      className={className}
    />
  );
}

function RichText({ text, className }) {
  const paragraphs = (text || "").split("\n\n");
  return (
    <div className={className}>
      {paragraphs.map((para, i) => {
        const lines = para.split("\n");
        const isBulletBlock = lines.some((l) => l.trim().startsWith("•"));
        if (isBulletBlock) {
          return (
            <ul key={i} className="space-y-1.5 my-2">
              {lines.map((l, j) =>
                l.trim().startsWith("•") ? (
                  <li key={j} className="flex gap-2">
                    <span className="mt-2 h-1 w-1 rounded-full bg-current opacity-50 shrink-0" />
                    <span>{l.replace("•", "").trim()}</span>
                  </li>
                ) : (
                  <p key={j}>{l}</p>
                )
              )}
            </ul>
          );
        }
        return (
          <p key={i} className="mb-2 last:mb-0">
            {para}
          </p>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navigation                                                         */
/* ------------------------------------------------------------------ */

function Sidebar({ theme, setTheme, view, goDashboard, goNew, dark }) {
  return (
    <>
      {/* Desktop rail */}
      <aside className={`hidden md:flex md:w-60 md:flex-col md:shrink-0 border-r ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <div className="px-6 pt-7 pb-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className={`font-serif text-[19px] font-semibold ${dark ? "text-white" : "text-slate-800"}`}>ProposalSwift</span>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1 font-sans">
          <button
            onClick={goDashboard}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              view === "dashboard"
                ? dark ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-50 text-indigo-700"
                : dark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          <button
            onClick={goNew}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              view === "builder"
                ? dark ? "bg-indigo-500/15 text-indigo-300" : "bg-indigo-50 text-indigo-700"
                : dark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Plus className="h-4 w-4" />
            New Proposal
          </button>
        </nav>
        <div className="p-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium font-sans transition-colors ${
              dark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <div className={`mt-2 flex items-center gap-2.5 px-3 py-2 rounded-lg ${dark ? "bg-slate-800" : "bg-slate-50"}`}>
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold font-sans">AR</div>
            <div className="text-xs font-sans leading-tight">
              <div className={`font-medium ${dark ? "text-slate-200" : "text-slate-700"}`}>Alex Rivera</div>
              <div className={dark ? "text-slate-500" : "text-slate-400"}>Freelance Designer</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className={`md:hidden flex items-center justify-between px-4 h-14 border-b sticky top-0 z-20 ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <button onClick={goDashboard} className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className={`font-serif text-[17px] font-semibold ${dark ? "text-white" : "text-slate-800"}`}>ProposalSwift</span>
        </button>
        <div className="flex items-center gap-1">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className={`p-2 rounded-lg ${dark ? "text-slate-400" : "text-slate-500"}`}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button onClick={goNew} className="p-2 rounded-lg bg-indigo-600 text-white">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

function Dashboard({ proposals, dark, goNew, openProposal }) {
  const totalRevenue = proposals.filter((p) => p.status === "Paid").reduce((sum, p) => sum + Number(p.price || 0), 0);
  const activeProposals = proposals.filter((p) => ["Sent", "Viewed", "Signed"].includes(p.status)).length;
  const pendingSignatures = proposals.filter((p) => ["Sent", "Viewed"].includes(p.status)).length;

  const stats = [
    { label: "Total Revenue", value: formatMoney(totalRevenue, "USD"), icon: DollarSign, accent: "text-emerald-500" },
    { label: "Active Proposals", value: activeProposals, icon: Briefcase, accent: "text-indigo-500" },
    { label: "Pending Signatures", value: pendingSignatures, icon: FileSignature, accent: "text-amber-500" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className={`font-serif text-3xl font-semibold ${dark ? "text-white" : "text-slate-800"}`}>Good to see you, Alex</h1>
          <p className={`font-sans text-sm mt-1 ${dark ? "text-slate-400" : "text-slate-500"}`}>Here's where every proposal stands right now.</p>
        </div>
        <button
          onClick={goNew}
          className="font-sans inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium px-4 py-2.5 shadow-sm shadow-indigo-600/20 transition-colors w-fit"
        >
          <Plus className="h-4 w-4" />
          Create New Proposal
        </button>
      </div>

      {/* Unified stat strip */}
      <div className={`rounded-xl border font-sans mb-8 grid grid-cols-1 sm:grid-cols-3 ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
        {stats.map((s, i) => (
          <div key={s.label} className={`px-6 py-5 flex items-center gap-4 ${i > 0 ? (dark ? "sm:border-l border-t sm:border-t-0 border-slate-800" : "sm:border-l border-t sm:border-t-0 border-slate-100") : ""}`}>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${dark ? "bg-slate-800" : "bg-slate-50"}`}>
              <s.icon className={`h-5 w-5 ${s.accent}`} />
            </div>
            <div>
              <div className={`text-2xl font-semibold font-serif ${dark ? "text-white" : "text-slate-800"}`}>{s.value}</div>
              <div className={`text-xs mt-0.5 ${dark ? "text-slate-500" : "text-slate-500"}`}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Proposals table */}
      <div className={`rounded-xl border overflow-hidden ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <div className={`px-6 py-4 border-b font-sans ${dark ? "border-slate-800" : "border-slate-100"}`}>
          <h2 className={`text-sm font-semibold ${dark ? "text-slate-200" : "text-slate-700"}`}>Recent proposals</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full font-sans text-sm">
            <thead>
              <tr className={dark ? "text-slate-500" : "text-slate-400"}>
                <th className="text-left font-medium px-6 py-3">Client</th>
                <th className="text-left font-medium px-6 py-3 hidden sm:table-cell">Service</th>
                <th className="text-left font-medium px-6 py-3 hidden md:table-cell">Value</th>
                <th className="text-left font-medium px-6 py-3">Status</th>
                <th className="text-left font-medium px-6 py-3 hidden lg:table-cell">Updated</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {proposals
                .slice()
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => openProposal(p.id)}
                    className={`cursor-pointer border-t transition-colors ${dark ? "border-slate-800 hover:bg-slate-800/60" : "border-slate-100 hover:bg-slate-50"}`}
                  >
                    <td className="px-6 py-3.5">
                      <div className={`font-medium ${dark ? "text-slate-200" : "text-slate-800"}`}>{p.clientName}</div>
                      <div className={`text-xs ${dark ? "text-slate-500" : "text-slate-400"}`}>{p.company}</div>
                    </td>
                    <td className={`px-6 py-3.5 hidden sm:table-cell ${dark ? "text-slate-400" : "text-slate-500"}`}>{p.service}</td>
                    <td className={`px-6 py-3.5 hidden md:table-cell ${dark ? "text-slate-300" : "text-slate-700"}`}>{formatMoney(p.price, p.currency)}</td>
                    <td className="px-6 py-3.5">
                      <StatusPill status={p.status} dark={dark} />
                    </td>
                    <td className={`px-6 py-3.5 hidden lg:table-cell ${dark ? "text-slate-500" : "text-slate-400"}`}>{formatDate(p.createdAt)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <ChevronRight className={`h-4 w-4 inline ${dark ? "text-slate-600" : "text-slate-300"}`} />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Proposal Builder                                                   */
/* ------------------------------------------------------------------ */

function FieldLabel({ icon: Icon, children, dark }) {
  return (
    <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 font-sans ${dark ? "text-slate-400" : "text-slate-500"}`}>
      <Icon className="h-3.5 w-3.5" />
      {children}
    </label>
  );
}

function inputClasses(dark) {
  return `w-full rounded-lg border px-3.5 py-2.5 text-sm font-sans outline-none transition-colors ${
    dark
      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-600 focus:border-indigo-500"
      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
  }`;
}

function Builder({ form, setForm, dark, onGenerate, generating, onCancel }) {
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const canSubmit = form.clientName && form.clientEmail && form.service && form.price;

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <button onClick={onCancel} className={`flex items-center gap-1.5 text-sm font-sans mb-6 ${dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"}`}>
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </button>

      <h1 className={`font-serif text-2xl font-semibold mb-1 ${dark ? "text-white" : "text-slate-800"}`}>New proposal</h1>
      <p className={`font-sans text-sm mb-8 ${dark ? "text-slate-400" : "text-slate-500"}`}>Fill in the essentials — the AI writer will turn this into a full, persuasive proposal.</p>

      <div className="relative">
        <div className={`absolute left-[15px] top-3 bottom-3 w-px ${dark ? "bg-slate-800" : "bg-slate-200"}`} />

        {/* Section 1 */}
        <div className="relative pl-10 pb-8">
          <div className={`absolute left-0 top-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold font-sans ${dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>1</div>
          <h2 className={`font-serif text-lg font-medium mb-4 ${dark ? "text-slate-100" : "text-slate-800"}`}>Client info</h2>
          <div className="space-y-4">
            <div>
              <FieldLabel icon={User} dark={dark}>Client name</FieldLabel>
              <input className={inputClasses(dark)} placeholder="Maren Voss" value={form.clientName} onChange={set("clientName")} />
            </div>
            <div>
              <FieldLabel icon={Mail} dark={dark}>Client email</FieldLabel>
              <input className={inputClasses(dark)} placeholder="maren@northlane.studio" value={form.clientEmail} onChange={set("clientEmail")} />
            </div>
            <div>
              <FieldLabel icon={Building2} dark={dark}>Company name</FieldLabel>
              <input className={inputClasses(dark)} placeholder="Northlane Studio" value={form.company} onChange={set("company")} />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="relative pl-10 pb-8">
          <div className={`absolute left-0 top-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold font-sans ${dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>2</div>
          <h2 className={`font-serif text-lg font-medium mb-4 ${dark ? "text-slate-100" : "text-slate-800"}`}>Project details</h2>
          <div className="space-y-4">
            <div>
              <FieldLabel icon={Briefcase} dark={dark}>Core service</FieldLabel>
              <input className={inputClasses(dark)} placeholder="Web Design, Copywriting, SEO Audit…" value={form.service} onChange={set("service")} />
            </div>
            <div>
              <FieldLabel icon={Sparkles} dark={dark}>Rough notes</FieldLabel>
              <AutoTextarea
                className={inputClasses(dark) + " resize-none"}
                placeholder="Jot down whatever you've got — messy is fine. e.g. 5-page marketing site redesign, needs to feel premium, mobile-first, current site is on Squarespace…"
                value={form.notes}
                onChange={set("notes")}
              />
            </div>
            <div>
              <FieldLabel icon={Calendar} dark={dark}>Deadline</FieldLabel>
              <input type="date" className={inputClasses(dark)} value={form.deadline} onChange={set("deadline")} />
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="relative pl-10">
          <div className={`absolute left-0 top-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold font-sans ${dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>3</div>
          <h2 className={`font-serif text-lg font-medium mb-4 ${dark ? "text-slate-100" : "text-slate-800"}`}>Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel icon={DollarSign} dark={dark}>Total price</FieldLabel>
              <input type="number" min="0" className={inputClasses(dark)} placeholder="4200" value={form.price} onChange={set("price")} />
            </div>
            <div>
              <FieldLabel icon={Wallet} dark={dark}>Currency</FieldLabel>
              <select className={inputClasses(dark)} value={form.currency} onChange={set("currency")}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div className="col-span-2">
              <FieldLabel icon={Percent} dark={dark}>Deposit required: {form.deposit}%</FieldLabel>
              <input type="range" min="0" max="100" step="5" value={form.deposit} onChange={set("deposit")} className="w-full accent-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      <button
        disabled={!canSubmit || generating}
        onClick={onGenerate}
        className="mt-10 w-full font-sans inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-3.5 shadow-sm shadow-indigo-600/20 transition-colors"
      >
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {generating ? "Writing your proposal…" : "Generate Professional Proposal with AI"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Preview & Editor (freelancer-facing)                                */
/* ------------------------------------------------------------------ */

function Preview({ proposal, updateContent, dark, onBack, onPublish, onOpenClientView, copied }) {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <button onClick={onBack} className={`flex items-center gap-1.5 text-sm font-sans ${dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"}`}>
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenClientView}
            className={`font-sans inline-flex items-center gap-2 rounded-lg border text-sm font-medium px-3.5 py-2 transition-colors ${
              dark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Eye className="h-4 w-4" /> View as client
          </button>
          <button
            onClick={onPublish}
            className="font-sans inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3.5 py-2 shadow-sm shadow-indigo-600/20 transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Link copied" : "Publish & Copy Link"}
          </button>
        </div>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${dark ? "border-slate-800" : "border-slate-200"}`}>
        {/* "paper" document surface stays warm/cream regardless of app theme */}
        <div className="bg-[#FBF9F4] px-6 sm:px-12 py-10 sm:py-14">
          <div className="flex items-start justify-between mb-10 pb-6 border-b border-slate-800/10">
            <div>
              <div className="font-serif text-2xl font-semibold text-slate-800">{proposal.company}</div>
              <div className="font-sans text-sm text-slate-500 mt-1">Prepared for {proposal.clientName}</div>
            </div>
            <div className="text-right font-sans text-sm text-slate-500">
              <div>Alex Rivera</div>
              <div>Freelance Designer</div>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-800 mb-2 leading-tight">
            Proposal for {proposal.service}
          </h1>
          <p className="font-sans text-sm text-slate-500 mb-10">Deadline: {formatDate(proposal.deadline)} · Investment: {formatMoney(proposal.price, proposal.currency)}</p>

          <div className="space-y-8">
            {SECTION_ORDER.map(([key, label]) => (
              <div key={key}>
                <h3 className="font-serif text-lg font-medium text-slate-800 mb-2">{label}</h3>
                <AutoTextarea
                  value={proposal.content[key]}
                  onChange={(e) => updateContent(key, e.target.value)}
                  className="w-full resize-none bg-transparent border border-transparent hover:border-slate-800/10 focus:border-indigo-400 focus:bg-white/60 rounded-lg px-2 -mx-2 py-1 font-sans text-[15px] leading-relaxed text-slate-700 outline-none transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className={`font-sans text-xs mt-3 ${dark ? "text-slate-500" : "text-slate-400"}`}>Click into any section above to edit the AI-generated text before you send it.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Client-facing live view                                             */
/* ------------------------------------------------------------------ */

function PayModal({ proposal, onClose, onConfirm, processing }) {
  const depositAmt = Math.round((Number(proposal.price) * Number(proposal.deposit)) / 100);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm px-0 sm:px-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 font-sans">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">Checkout</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-lg bg-slate-50 px-4 py-3 mb-5">
          <div className="flex justify-between text-sm text-slate-500 mb-1">
            <span>Deposit ({proposal.deposit}%)</span>
            <span className="text-slate-800 font-medium">{formatMoney(depositAmt, proposal.currency)}</span>
          </div>
          <div className="text-xs text-slate-400">to {proposal.company || "Alex Rivera"}</div>
        </div>

        <div className="space-y-3 mb-5">
          <input readOnly value="4242 4242 4242 4242" className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-500 bg-slate-50" />
          <div className="grid grid-cols-2 gap-3">
            <input readOnly value="12 / 29" className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-500 bg-slate-50" />
            <input readOnly value="CVC 123" className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-500 bg-slate-50" />
          </div>
        </div>

        <button
          onClick={onConfirm}
          disabled={processing}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-3 transition-colors"
        >
          {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {processing ? "Processing…" : `Pay ${formatMoney(depositAmt, proposal.currency)}`}
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-3">Demo checkout — no real charge is made. A production build would create a real Stripe Checkout Session on the server.</p>
      </div>
    </div>
  );
}

function ClientView({ proposal, dark, onBack, onMarkViewed, onSign, onPay }) {
  const [signature, setSignature] = useState("");
  const [showPay, setShowPay] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (proposal.status === "Sent") {
      const t = setTimeout(() => onMarkViewed(proposal.id), 900);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal.id]);

  const isSigned = ["Signed", "Paid"].includes(proposal.status);
  const isPaid = proposal.status === "Paid";
  const depositAmt = Math.round((Number(proposal.price) * Number(proposal.deposit)) / 100);

  const confirmPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setShowPay(false);
      onPay(proposal.id);
    }, 1400);
  };

  return (
    <div className={`min-h-screen ${dark ? "bg-slate-950" : "bg-slate-100"}`}>
      <div className={`sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 h-14 border-b ${dark ? "border-slate-800 bg-slate-950/90" : "border-slate-200 bg-slate-100/90"} backdrop-blur`}>
        <button onClick={onBack} className={`flex items-center gap-1.5 text-sm font-sans ${dark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"}`}>
          <ArrowLeft className="h-4 w-4" /> Exit client view
        </button>
        <span className={`text-xs font-sans ${dark ? "text-slate-600" : "text-slate-400"}`}>Public proposal link — simulated</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-14 pb-40">
        <div className="bg-[#FBF9F4] rounded-2xl shadow-xl shadow-slate-900/5 px-6 sm:px-12 py-10 sm:py-14">
          <div className="flex items-start justify-between mb-10 pb-6 border-b border-slate-800/10">
            <div>
              <div className="font-serif text-2xl font-semibold text-slate-800">{proposal.company}</div>
              <div className="font-sans text-sm text-slate-500 mt-1">Prepared for {proposal.clientName}</div>
            </div>
            <div className="text-right font-sans text-sm text-slate-500">
              <div>Alex Rivera</div>
              <div>Freelance Designer</div>
            </div>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-slate-800 mb-2 leading-tight">
            Proposal for {proposal.service}
          </h1>
          <p className="font-sans text-sm text-slate-500 mb-10">Deadline: {formatDate(proposal.deadline)} · Investment: {formatMoney(proposal.price, proposal.currency)}</p>

          <div className="space-y-8 mb-4">
            {SECTION_ORDER.map(([key, label]) => (
              <div key={key}>
                <h3 className="font-serif text-lg font-medium text-slate-800 mb-2">{label}</h3>
                <RichText text={proposal.content[key]} className="font-sans text-[15px] leading-relaxed text-slate-700" />
              </div>
            ))}
          </div>

          {/* Signature */}
          <div className="mt-12 pt-8 border-t border-slate-800/10">
            <h3 className="font-serif text-lg font-medium text-slate-800 mb-3">Acceptance</h3>
            {isSigned ? (
              <div className="rounded-lg bg-violet-50 border border-violet-100 px-5 py-4">
                <div className="flex items-center gap-2 text-violet-700 font-sans text-sm font-medium mb-1">
                  <FileSignature className="h-4 w-4" /> Signed by {proposal.signature}
                </div>
                <div className="font-signature text-3xl text-violet-800">{proposal.signature}</div>
                <div className="font-sans text-xs text-violet-500 mt-1">{formatDate(proposal.signedAt)}</div>
              </div>
            ) : (
              <div>
                <p className="font-sans text-sm text-slate-500 mb-3">Type your full name to sign and accept this proposal.</p>
                <input
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-lg border border-slate-800/15 bg-white px-4 py-3 font-signature text-2xl text-slate-800 outline-none focus:border-indigo-400 mb-3"
                />
                <button
                  disabled={!signature.trim()}
                  onClick={() => onSign(proposal.id, signature.trim())}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-sm font-sans font-medium px-5 py-3 transition-colors"
                >
                  <FileSignature className="h-4 w-4" /> Sign & Accept Proposal
                </button>
              </div>
            )}
          </div>

          {/* Payment */}
          {isSigned && (
            <div className="mt-8 pt-8 border-t border-slate-800/10">
              <h3 className="font-serif text-lg font-medium text-slate-800 mb-3">Payment</h3>
              {isPaid ? (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-5 py-4 flex items-center gap-2 text-emerald-700 font-sans text-sm font-medium">
                  <ShieldCheck className="h-4 w-4" /> Deposit of {formatMoney(depositAmt, proposal.currency)} received on {formatDate(proposal.paidAt)}
                </div>
              ) : (
                <div>
                  <p className="font-sans text-sm text-slate-500 mb-3">
                    A deposit of {formatMoney(depositAmt, proposal.currency)} ({proposal.deposit}%) confirms your start date.
                  </p>
                  <button
                    onClick={() => setShowPay(true)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-sans font-medium px-5 py-3 shadow-sm shadow-indigo-600/20 transition-colors"
                  >
                    <CreditCard className="h-4 w-4" /> Pay Securely via Stripe
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile sticky CTA */}
      {!isPaid && (
        <div className={`sm:hidden fixed bottom-0 inset-x-0 border-t px-4 py-3 ${dark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"}`}>
          {!isSigned ? (
            <div className="font-sans text-xs text-center text-slate-400">Scroll up to sign the proposal</div>
          ) : (
            <button
              onClick={() => setShowPay(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 text-white text-sm font-sans font-medium px-4 py-3"
            >
              <CreditCard className="h-4 w-4" /> Pay {formatMoney(depositAmt, proposal.currency)} deposit
            </button>
          )}
        </div>
      )}

      {showPay && <PayModal proposal={proposal} onClose={() => setShowPay(false)} onConfirm={confirmPayment} processing={processing} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toast                                                               */
/* ------------------------------------------------------------------ */

function Toast({ toast, dark }) {
  if (!toast) return null;
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 font-sans">
      <div className={`flex items-center gap-2.5 rounded-lg border px-4 py-3 shadow-lg text-sm ${dark ? "bg-slate-800 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-800"}`}>
        <Bell className="h-4 w-4 text-indigo-500 shrink-0" />
        {toast}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root App                                                            */
/* ------------------------------------------------------------------ */

export default function App() {
  const [theme, setTheme] = useState("light");
  const dark = theme === "dark";
  const [view, setView] = useState("dashboard"); // dashboard | builder | preview | client
  const [proposals, setProposals] = useState(initialProposals);
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const activeProposal = proposals.find((p) => p.id === activeId) || null;

  const goDashboard = () => setView("dashboard");
  const goNew = () => {
    setForm(emptyForm);
    setView("builder");
  };
  const openProposal = (id) => {
    setActiveId(id);
    setCopied(false);
    setView("preview");
  };

  const updateProposal = (id, patch) => {
    setProposals((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const updateContent = (key, value) => {
    if (!activeProposal) return;
    updateProposal(activeProposal.id, { content: { ...activeProposal.content, [key]: value } });
  };

  /* ---- AI generation ---- */
  const generateProposal = useCallback(async () => {
    setGenerating(true);
    const newId = "p" + Date.now();
    const draft = {
      id: newId,
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      company: form.company,
      service: form.service,
      notes: form.notes,
      deadline: form.deadline,
      price: Number(form.price) || 0,
      currency: form.currency,
      deposit: Number(form.deposit) || 0,
      status: "Draft",
      createdAt: new Date().toISOString(),
      viewedAt: null,
      signedAt: null,
      paidAt: null,
      signature: null,
      content: null,
    };

    let content = null;
    try {
      const systemPrompt =
        "You are an expert proposal writer for freelancers and small agencies. Respond ONLY with a single raw JSON object " +
        "(no markdown fences, no preamble, no explanation) with exactly these string keys: executiveSummary, scopeOfWork, " +
        "deliverables, timeline, financialInvestment, terms. Each value is plain text using \\n\\n between paragraphs and " +
        "\\n• for bullet points where useful. Keep each section under 90 words. Be persuasive, specific, and professional. " +
        "Rewrite the client's rough notes in polished business language rather than repeating them verbatim.";

      const userPrompt = `Write a client proposal from these details:
Client name: ${draft.clientName}
Company: ${draft.company}
Core service: ${draft.service}
Rough notes from the freelancer: ${draft.notes || "none provided"}
Deadline: ${draft.deadline || "flexible"}
Total price: ${draft.price} ${draft.currency}
Deposit required: ${draft.deposit}%`;

      // Calls our own backend (server/index.js), which holds the ANTHROPIC_API_KEY
      // and forwards the request to https://api.anthropic.com/v1/messages.
      // The key must never be called directly from the browser in a real deployment.
      const response = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      });
      const data = await response.json();
      const textBlock = (data.content || []).find((b) => b.type === "text");
      const raw = (textBlock?.text || "").trim().replace(/^```json\s*|^```\s*|```$/g, "");
      const parsed = JSON.parse(raw);
      const requiredKeys = ["executiveSummary", "scopeOfWork", "deliverables", "timeline", "financialInvestment", "terms"];
      if (requiredKeys.every((k) => typeof parsed[k] === "string")) {
        content = parsed;
      } else {
        throw new Error("Malformed AI response");
      }
    } catch (err) {
      content = buildFallbackContent(draft);
    }

    const finalProposal = { ...draft, content };
    setProposals((prev) => [finalProposal, ...prev]);
    setActiveId(newId);
    setGenerating(false);
    setCopied(false);
    setView("preview");
  }, [form]);

  /* ---- Publish ---- */
  const publish = () => {
    if (!activeProposal) return;
    if (activeProposal.status === "Draft") {
      updateProposal(activeProposal.id, { status: "Sent" });
    }
    const link = `https://proposalswift.app/p/${activeProposal.id}`;
    try {
      navigator.clipboard?.writeText(link);
    } catch {
      /* clipboard unavailable in this environment — link still shown via toast */
    }
    setCopied(true);
    setToast(`Link copied: ${link}`);
    setTimeout(() => setCopied(false), 2500);
  };

  const openClientView = () => setView("client");

  const markViewed = (id) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== id || p.status !== "Sent") return p;
        return { ...p, status: "Viewed", viewedAt: new Date().toISOString() };
      })
    );
    const p = proposals.find((pp) => pp.id === id);
    if (p) setToast(`${p.clientName} just viewed the proposal`);
  };

  const signProposal = (id, name) => {
    updateProposal(id, { status: "Signed", signature: name, signedAt: new Date().toISOString() });
    const p = proposals.find((pp) => pp.id === id);
    setToast(`${name} signed the proposal 🎉`);
  };

  const payProposal = (id) => {
    updateProposal(id, { status: "Paid", paidAt: new Date().toISOString() });
    setToast("Deposit received — payment recorded");
  };

  const bg = dark ? "bg-slate-950" : "bg-slate-50";

  return (
    <div className={`font-sans ${bg} min-h-screen`}>
      {view === "client" && activeProposal ? (
        <ClientView proposal={activeProposal} dark={dark} onBack={() => setView("preview")} onMarkViewed={markViewed} onSign={signProposal} onPay={payProposal} />
      ) : (
        <div className="flex min-h-screen">
          <Sidebar theme={theme} setTheme={setTheme} view={view} goDashboard={goDashboard} goNew={goNew} dark={dark} />
          <main className="flex-1 min-w-0">
            {view === "dashboard" && <Dashboard proposals={proposals} dark={dark} goNew={goNew} openProposal={openProposal} />}
            {view === "builder" && <Builder form={form} setForm={setForm} dark={dark} onGenerate={generateProposal} generating={generating} onCancel={goDashboard} />}
            {view === "preview" && activeProposal && (
              <Preview
                proposal={activeProposal}
                updateContent={updateContent}
                dark={dark}
                onBack={goDashboard}
                onPublish={publish}
                onOpenClientView={openClientView}
                copied={copied}
              />
            )}
          </main>
        </div>
      )}
      <Toast toast={toast} dark={dark} />
    </div>
  );
}
