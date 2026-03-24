import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";

// ── Category config ──

const CATEGORIES = [
  { value: "real_estate_broker", label: "Real Estate Broker/Agent" },
  { value: "real_estate_lawyer", label: "Real Estate Lawyer" },
  { value: "mortgage_advisor", label: "Mortgage Advisor" },
  { value: "currency_transfer", label: "Currency Transfer" },
  { value: "tax_advisor", label: "Tax Advisor" },
  { value: "property_manager", label: "Property Manager" },
  { value: "home_inspector", label: "Home Inspector" },
  { value: "insurance", label: "Insurance Agent" },
  { value: "relocation_services", label: "Relocation Services" },
  { value: "renovation", label: "Interior Design / Renovation" },
  { value: "other", label: "Other" },
] as const;

const LANGUAGE_OPTIONS = ["English", "Hebrew", "French", "Russian", "Spanish", "Other"];

// ── Review questions by category ──

const GENERAL_QUESTIONS: { key: string; question: string }[] = [
  { key: "general_inaccuracies", question: "Anything on our city pages that strikes you as inaccurate or missing?" },
  { key: "general_misconceptions", question: "What do English speakers most commonly get wrong about this market?" },
  { key: "general_common_questions", question: "What questions do your English-speaking clients ask you most?" },
];

const CATEGORY_QUESTIONS: Record<string, { key: string; question: string }[]> = {
  real_estate_broker: [
    { key: "broker_anglo_neighborhoods", question: "Which neighborhoods are Anglo clients typically looking in?" },
    { key: "broker_price_ranges", question: "What are realistic price ranges for what English speakers are buying right now?" },
    { key: "broker_new_developments", question: "Any new developments or projects targeting the Anglo community?" },
    { key: "broker_market_feel", question: "How does the market feel right now compared to 12 months ago?" },
  ],
  real_estate_lawyer: [
    { key: "lawyer_pitfalls", question: "What are the most common legal pitfalls English speakers face when buying?" },
    { key: "lawyer_local_issues", question: "Any local planning or municipal issues buyers should know about (tama, pinui binui, building violations)?" },
    { key: "lawyer_overlooked", question: "What documentation or legal steps do buyers commonly overlook?" },
  ],
  mortgage_advisor: [
    { key: "mortgage_structures", question: "What mortgage structures are Anglo buyers mostly going with right now?" },
    { key: "mortgage_misconceptions", question: "What's the biggest misconception English speakers have about Israeli mortgages?" },
    { key: "mortgage_income_docs", question: "How do banks typically treat Anglo/foreign income documentation?" },
  ],
  currency_transfer: [
    { key: "fx_timing_mistakes", question: "What timing or strategy mistakes do English speakers commonly make with currency transfers?" },
    { key: "fx_advance_planning", question: "How far in advance of closing should buyers start thinking about transfers?" },
    { key: "fx_expensive_mistake", question: "What's the most expensive mistake you've seen a client make?" },
  ],
  tax_advisor: [
    { key: "tax_missed_implications", question: "What tax implications do English speakers most commonly miss?" },
    { key: "tax_treaty_issues", question: "Any US/UK tax treaty issues that come up frequently for buyers?" },
    { key: "tax_surprises", question: "How do capital gains and rental income taxation typically surprise foreign buyers?" },
  ],
  property_manager: [
    { key: "pm_rental_yields", question: "What rental yields are realistic in your area for Anglo investor-owned properties?" },
    { key: "pm_remote_ownership", question: "What do foreign owners most commonly underestimate about managing property remotely?" },
    { key: "pm_tenant_market", question: "How quickly do properties rent, and what's the typical tenant profile?" },
  ],
  home_inspector: [
    { key: "inspector_common_issues", question: "What are the most common building issues you find in your area?" },
    { key: "inspector_construction_quality", question: "What should buyers know about construction quality in newer vs. older buildings?" },
    { key: "inspector_regional", question: "Anything specific to your region (earthquake codes, humidity, building materials)?" },
  ],
  insurance: [
    { key: "insurance_surprises", question: "What insurance requirements surprise English speakers?" },
    { key: "insurance_differences", question: "How does home/building insurance in Israel differ from the US/UK?" },
    { key: "insurance_coverage_gaps", question: "What coverage gaps do you commonly see with Anglo buyers?" },
  ],
  relocation_services: [
    { key: "relocation_challenges", question: "What's the biggest non-real-estate challenge English speakers face settling here?" },
    { key: "relocation_bureaucracy", question: "Any local bureaucratic processes (municipality, arnona, schools) that need a heads-up?" },
    { key: "relocation_settling_time", question: "How long does it typically take an Anglo family to feel settled?" },
  ],
  renovation: [
    { key: "reno_costs", question: "What renovation costs should buyers budget for in your area?" },
    { key: "reno_contractor_market", question: "How does the contractor/renovation market work differently than in the US/UK?" },
    { key: "reno_timelines", question: "What are typical timelines for apartment renovations?" },
    { key: "reno_building_issues", question: "Any building code or vaad bayit issues that commonly affect renovation plans?" },
  ],
  other: [
    { key: "other_expertise", question: "What should English speakers know about your area of expertise as it relates to Israeli real estate?" },
  ],
};

// ── Component ──

const ProviderSignupForm = () => {
  // Basic fields
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [category, setCategory] = useState("");
  const [categoryOther, setCategoryOther] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [yearsActive, setYearsActive] = useState("");
  const [citiesCovered, setCitiesCovered] = useState("");
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [bio, setBio] = useState("");
  const [howFoundUs, setHowFoundUs] = useState("");
  const [shareAgreed, setShareAgreed] = useState(false);

  // Review questions
  const [reviewResponses, setReviewResponses] = useState<Record<string, string>>({});

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ── Language toggle ──

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  // ── Review response handler ──

  const setReviewResponse = (key: string, value: string) => {
    setReviewResponses((prev) => ({ ...prev, [key]: value }));
  };

  // ── Validation ──

  const validate = (): string | null => {
    if (!fullName.trim()) return "Full name is required.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "A valid email address is required.";
    if (!phone.trim()) return "Phone number is required.";
    if (!category) return "Please select a service category.";
    if (category === "other" && !categoryOther.trim())
      return "Please specify your service category.";
    if (!citiesCovered.trim())
      return "Please enter the cities or areas you cover.";
    if (languages.length === 0) return "Please select at least one language.";
    if (!shareAgreed) return "Please agree to share Navlan with your network.";
    return null;
  };

  // ── Submit ──

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setSubmitting(true);
    try {
      // Build review_responses JSONB — omit empty values
      const filteredReviews: Record<string, string> = {};
      for (const [key, val] of Object.entries(reviewResponses)) {
        if (val.trim()) filteredReviews[key] = val.trim();
      }

      const { error: insertError } = await supabase
        .from("providers" as any)
        .insert([
          {
            full_name: fullName.trim(),
            company_name: companyName.trim() || null,
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            website_url: website.trim() || null,
            linkedin_url: linkedin.trim() || null,
            facebook_url: facebook.trim() || null,
            instagram_url: instagram.trim() || null,
            tiktok_url: tiktok.trim() || null,
            category,
            category_other: category === "other" ? categoryOther.trim() : null,
            license_number: licenseNumber.trim() || null,
            years_active: yearsActive ? parseInt(yearsActive, 10) : null,
            languages,
            cities_covered: citiesCovered.trim(),
            bio: bio.trim() || null,
            how_found_us: howFoundUs.trim() || null,
            review_responses:
              Object.keys(filteredReviews).length > 0 ? filteredReviews : null,
            status: "pending",
          },
        ] as any)
        .select("id")
        .single();

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err: any) {
      console.error("Provider signup error:", err);
      if (err?.code === "23505" || err?.message?.includes("duplicate")) {
        toast.error("It looks like you've already applied with this email.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ──

  if (submitted) {
    return (
      <div className="bg-cream rounded-xl p-8 md:p-12 text-center">
        <div className="w-14 h-14 bg-sage/15 rounded-full flex items-center justify-center mx-auto mb-5">
          <Check className="h-7 w-7 text-sage" />
        </div>
        <h3 className="font-heading font-bold text-[22px] text-charcoal mb-3">
          Thanks for applying!
        </h3>
        <p className="font-body text-[16px] text-warm-gray max-w-md mx-auto mb-6 leading-relaxed">
          We'll review your application and be in touch within a few days. Your
          market knowledge helps us keep Navlan accurate for English speakers —
          we really appreciate it.
        </p>
        <Link
          to="/cities"
          className="inline-block font-body font-medium text-[15px] text-horizon-blue hover:underline"
        >
          In the meantime, explore the city pages &rarr;
        </Link>
      </div>
    );
  }

  // ── Review questions section ──

  const reviewQuestions = category
    ? [...GENERAL_QUESTIONS, ...(CATEGORY_QUESTIONS[category] || [])]
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Full Name */}
      <Field label="Full Name" required>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={inputClass}
          placeholder="Your full name"
        />
      </Field>

      {/* Company Name */}
      <Field label="Company Name">
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={inputClass}
          placeholder="Company or firm name"
        />
      </Field>

      {/* Email */}
      <Field label="Email" required>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
      </Field>

      {/* Phone */}
      <Field label="Phone" required>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="+972 or +1 ..."
        />
      </Field>

      {/* Website */}
      <Field label="Website">
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className={inputClass}
          placeholder="https://yoursite.com"
        />
      </Field>

      {/* LinkedIn */}
      <Field label="LinkedIn Profile">
        <input
          type="url"
          value={linkedin}
          onChange={(e) => setLinkedin(e.target.value)}
          className={inputClass}
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </Field>

      {/* Facebook */}
      <Field label="Facebook Page">
        <input
          type="url"
          value={facebook}
          onChange={(e) => setFacebook(e.target.value)}
          className={inputClass}
          placeholder="https://facebook.com/yourpage"
        />
      </Field>

      {/* Instagram */}
      <Field label="Instagram">
        <input
          type="url"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          className={inputClass}
          placeholder="https://instagram.com/yourhandle"
        />
      </Field>

      {/* TikTok */}
      <Field label="TikTok">
        <input
          type="url"
          value={tiktok}
          onChange={(e) => setTiktok(e.target.value)}
          className={inputClass}
          placeholder="https://tiktok.com/@yourhandle"
        />
      </Field>

      {/* Service Category */}
      <Field label="Service Category" required>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setReviewResponses({});
          }}
          className={`${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236B7178%22%20d%3D%22M2%204l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center]`}
        >
          <option value="">Select your service category</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Other category text */}
      {category === "other" && (
        <Field label="Please specify your service" required>
          <input
            type="text"
            value={categoryOther}
            onChange={(e) => setCategoryOther(e.target.value)}
            className={inputClass}
            placeholder="Describe your service"
          />
        </Field>
      )}

      {/* License */}
      <Field label="License or registration number (if applicable)">
        <input
          type="text"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          className={inputClass}
          placeholder="License or registration number"
        />
      </Field>

      {/* Years Active */}
      <Field label="Years Active in Israel">
        <input
          type="number"
          min="0"
          max="99"
          value={yearsActive}
          onChange={(e) => setYearsActive(e.target.value)}
          className={inputClass}
          placeholder="e.g. 5"
        />
      </Field>

      {/* Cities / Areas */}
      <Field label="Cities / Areas You Cover" required>
        <input
          type="text"
          value={citiesCovered}
          onChange={(e) => setCitiesCovered(e.target.value)}
          className={inputClass}
          placeholder="e.g. Modi'in, Beit Shemesh, Jerusalem — Old Katamon"
        />
      </Field>

      {/* Languages */}
      <Field label="Languages" required>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`px-4 py-2 rounded-full font-body text-[14px] font-medium border transition-colors ${
                languages.includes(lang)
                  ? "bg-sage text-white border-sage"
                  : "bg-white text-charcoal border-border-light hover:border-sage/50"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </Field>

      {/* Bio */}
      <Field label="Brief Bio">
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 500))}
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="Tell potential clients about yourself and your expertise (2-3 sentences)"
          maxLength={500}
        />
        <p className="mt-1.5 font-body text-[13px] text-warm-gray text-right">
          {bio.length}/500
        </p>
      </Field>

      {/* How found us */}
      <Field label="How did you hear about Navlan?">
        <input
          type="text"
          value={howFoundUs}
          onChange={(e) => setHowFoundUs(e.target.value)}
          className={inputClass}
          placeholder='e.g. LinkedIn, Facebook group, word of mouth'
        />
      </Field>

      {/* ── Dynamic Review Questions ── */}
      {category && reviewQuestions.length > 0 && (
        <div className="bg-cream rounded-xl p-6 md:p-8 space-y-5 animate-in fade-in duration-300">
          <div>
            <h3 className="font-heading font-semibold text-[20px] text-charcoal mb-1.5">
              Share Your Market Knowledge
            </h3>
            <p className="font-body text-[15px] text-warm-gray leading-relaxed">
              Help us keep Navlan accurate. Answer any questions that are relevant
              to you — the more detail, the better.
            </p>
          </div>
          {reviewQuestions.map((q) => (
            <div key={q.key}>
              <label className="block font-body font-medium text-[15px] text-charcoal mb-1.5">
                {q.question}
              </label>
              <textarea
                value={reviewResponses[q.key] || ""}
                onChange={(e) => setReviewResponse(q.key, e.target.value)}
                className={`${inputClass} resize-none`}
                rows={2}
                style={{ minHeight: "60px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = target.scrollHeight + "px";
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Agreement checkbox */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={shareAgreed}
          onChange={(e) => setShareAgreed(e.target.checked)}
          className="w-5 h-5 mt-0.5 rounded border-border-light text-sage focus:ring-sage accent-sage flex-shrink-0"
        />
        <span className="font-body text-[15px] text-charcoal leading-snug">
          I'm happy to share Navlan with my clients and network
        </span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full h-12 bg-sage hover:bg-sage-dark text-white font-body font-semibold text-[16px] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Application"
        )}
      </button>
    </form>
  );
};

// ── Shared styles ──

const inputClass =
  "w-full h-11 px-4 bg-white border border-border-light rounded-lg font-body text-[15px] text-charcoal placeholder:text-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-colors";

// ── Field wrapper ──

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block font-body font-medium text-[15px] text-charcoal mb-1.5">
      {label}
      {required && <span className="text-terra-red ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

export default ProviderSignupForm;
