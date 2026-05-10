import { getAvatarUrl } from "@/lib/profile-utils";

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function firstArray(...values: unknown[]): unknown[] {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) return value;
  }
  return [];
}

// Normalize a single experience entry — keep all descriptive content
function normalizeExpItem(item: unknown): Record<string, unknown> {
  if (typeof item === "string") return { title: item, description: item };
  if (!item || typeof item !== "object") return {};
  const d = item as Record<string, unknown>;
  return {
    title: firstString(d.title, d.position, d.role, d.jobTitle, d.job_title),
    company: firstString(d.companyName, d.company, d.organization, d.organisation, d.employer, d.org, d.name),
    description: firstString(d.description, d.summary, d.details, d.responsibilities, d.body, d.content),
    duration: firstString(d.duration, d.tenure, d.period, d.timePeriod as string),
    location: firstString(d.location, d.locationName),
    employmentType: firstString(d.employmentType, d.type, d.contractType),
    ...d,
  };
}

// Normalize a single education entry
function normalizeEduItem(item: unknown): Record<string, unknown> {
  if (typeof item === "string") return { school: item, description: item };
  if (!item || typeof item !== "object") return {};
  const d = item as Record<string, unknown>;
  return {
    school: firstString(d.schoolName, d.school, d.institution, d.university, d.college, d.name),
    degree: firstString(d.degreeName, d.degree, d.qualification, d.degreeType),
    field: firstString(d.fieldOfStudy, d.field, d.major, d.subject, d.course),
    description: firstString(d.description, d.activities, d.notes, d.summary, d.extracurriculars),
    grade: firstString(d.grade, d.gpa, d.score, d.result),
    ...d,
  };
}

// Normalize a skill entry to always have a readable name
function normalizeSkillItem(item: unknown): Record<string, unknown> {
  if (typeof item === "string") return { name: item };
  if (!item || typeof item !== "object") return {};
  const d = item as Record<string, unknown>;
  return {
    name: firstString(d.name, d.skill, d.title, d.text, d.label),
    endorsements: d.endorsements || d.endorsementCount || 0,
    ...d,
  };
}

// Normalize a project/publication/certification entry
function normalizeProjectItem(item: unknown): Record<string, unknown> {
  if (typeof item === "string") return { name: item, description: item };
  if (!item || typeof item !== "object") return {};
  const d = item as Record<string, unknown>;
  return {
    name: firstString(d.name, d.title, d.projectName),
    description: firstString(d.description, d.summary, d.body, d.details, d.abstract),
    url: firstString(d.url, d.link, d.projectUrl),
    ...d,
  };
}

function normalizeLinkedInData(raw: unknown, profileUrl: string) {
  const data = (raw as Record<string, unknown>)?.data &&
    typeof (raw as Record<string, unknown>).data === "object"
    ? (raw as Record<string, unknown>).data as Record<string, unknown>
    : raw as Record<string, unknown>;

  if (!data || typeof data !== "object") return null;

  const fullName = firstString(
    data.fullName, data.full_name, data.name, data.title,
    [data.firstName, data.lastName].filter(Boolean).join(" "),
    [data.first_name, data.last_name].filter(Boolean).join(" ")
  );
  const headline = firstString(data.headline, data.head_line, data.tagline, data.subtitle, data.occupation);
  const avatar = getAvatarUrl(data);

  // Extract the About / Summary section — most unique per-person signal
  const summary = firstString(
    data.summary, data.about, data.description, data.bio,
    data.overview, data.profileSummary, data.profile_summary
  );

  // Normalize each entry deeply so descriptions are preserved
  const rawExperience = firstArray(data.position, data.fullPositions, data.positions, data.experience, data.experiences, data.workExperience, data.jobs, data.employments);
  const rawEducation = firstArray(data.education, data.educations, data.schools, data.school);
  const rawSkills = firstArray(data.skills, data.topSkills, data.skill, data.skillEndorsements);
  const rawProjects = firstArray(data.projects, data.project);
  const rawCerts = firstArray(data.certifications, data.certification, data.licenses, data.licenseAndCertifications);
  const rawPublications = firstArray(data.publications, data.publication);
  const rawAwards = firstArray(data.honors, data.awards, data.honorsAndAwards, data.achievements);
  const rawVolunteer = firstArray(data.volunteerExperiences, data.volunteer, data.volunteerWork, data.volunteering);
  const rawLanguages = firstArray(data.languages, data.language);

  const experience = rawExperience.map(normalizeExpItem);
  const education = rawEducation.map(normalizeEduItem);
  const skills = rawSkills.map(normalizeSkillItem);
  const projects = [
    ...rawProjects.map(normalizeProjectItem),
    ...rawCerts.map(normalizeProjectItem),
    ...rawPublications.map(normalizeProjectItem),
    ...rawAwards.map(normalizeProjectItem),
  ];
  const volunteer = rawVolunteer.map(normalizeExpItem);

  if (!fullName && !headline && !avatar && experience.length === 0 && education.length === 0 && skills.length === 0) {
    return null;
  }

  return {
    fullName,
    firstName: firstString(data.firstName, data.first_name, fullName.split(" ")[0]),
    lastName: firstString(data.lastName, data.last_name),
    headline,
    avatar,
    summary,
    profileUrl,
    // Structured arrays with rich descriptions
    experience,
    education,
    skills,
    projects,
    volunteer,
    languages: rawLanguages,
    // Extra signals
    connectionCount: data.connectionCount || data.connections || data.followersCount || 0,
    university: firstString(data.university, data.school, data.schoolName),
    location: firstString(data.location, data.locationName, data.country, data.city),
    website: firstString(data.website, data.websiteUrl, data.portfolioUrl),
    source: "rapidapi-linkedin",
  };
}

function extractLinkedInUsername(profileUrl: string) {
  const match = profileUrl.match(/linkedin\.com\/in\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]) : "";
}

async function fetchFreshLinkedInProfile(profileUrl: string, signal: AbortSignal) {
  const username = extractLinkedInUsername(profileUrl);
  if (!username) return null;

  const response = await fetch(
    `https://fresh-linkedin-scraper-api.p.rapidapi.com/api/v1/user/profile?username=${encodeURIComponent(username)}`,
    {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        "x-rapidapi-host": "fresh-linkedin-scraper-api.p.rapidapi.com",
      },
      signal,
    }
  );

  let data: unknown;
  try { data = await response.json(); } catch { return null; }

  const d = data as Record<string, unknown>;
  if (!response.ok || d?.success === false || d?.error) return null;

  console.log("[fresh] raw keys:", Object.keys((d?.data as Record<string, unknown>) ?? d ?? {}));
  const normalized = normalizeLinkedInData(data, profileUrl);
  if (normalized) {
    console.log("[fresh] exp:", normalized.experience.length, "edu:", normalized.education.length, "skills:", normalized.skills.length, "summary:", normalized.summary?.length ?? 0);
  }
  return normalized ? { ...normalized, username, source: "rapidapi-fresh-linkedin" } : null;
}

async function fetchLinkedInEnricher(profileUrl: string, signal: AbortSignal) {
  const response = await fetch(
    `https://li-data-scraper.p.rapidapi.com/get-profile-data-by-url?url=${encodeURIComponent(profileUrl)}`,
    {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        "x-rapidapi-host": "li-data-scraper.p.rapidapi.com",
      },
      signal,
    }
  );

  let data: unknown;
  try { data = await response.json(); } catch { return null; }

  const d = data as Record<string, unknown>;
  if (!response.ok || d?.success === false || d?.error || (d?.message as string)?.includes("no longer")) return null;

  const normalized = normalizeLinkedInData(data, profileUrl);
  if (normalized) {
    console.log("[enricher] exp:", normalized.experience.length, "edu:", normalized.education.length, "skills:", normalized.skills.length, "summary:", normalized.summary?.length ?? 0);
  }
  return normalized;
}

// HTML fallback — extract real text, don't fabricate fake arrays
function parseLinkedInHTML(html: string, profileUrl: string) {
  const nameMatch = html.match(/<title>([^|<]+)\s*[\|–-]\s*LinkedIn/i);
  const name = nameMatch ? nameMatch[1].trim() : "";

  const headlineMatch = html.match(/class="[^"]*text-body-medium[^"]*"[^>]*>([^<]{10,120})</i);
  const headline = headlineMatch ? headlineMatch[1].trim() : "";

  const avatarMatch = html.match(/property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/name=["']image["'][^>]+content=["']([^"']+)["']/i);
  const avatar = avatarMatch ? avatarMatch[1] : "";

  // Extract actual skill names from HTML text
  const TECH_RE = /\b(Python|JavaScript|TypeScript|Java|C\+\+|C#|React|Next\.js|Node\.js|Vue|Angular|AWS|SQL|HTML|CSS|Git|Docker|Kubernetes|MongoDB|PostgreSQL|GraphQL|Swift|Kotlin|Go|Rust|PHP|Ruby|TensorFlow|PyTorch|Linux|Azure|GCP|Firebase|Figma|Pandas|NumPy|Spark|Kafka|Terraform|Django|FastAPI|Flask|Spring)\b/gi;
  const skillMatches = [...new Set((html.match(TECH_RE) || []).map(s => s.toLowerCase()))];
  const skills = skillMatches.map(name => ({ name }));

  // Extract university name from HTML
  const uniMatch = html.match(/([A-Z][a-zA-Z\s]{3,40}(?:University|College|Institute|Polytechnic|Academy))/);
  const university = uniMatch ? uniMatch[1].trim() : "";

  const education = university ? [normalizeEduItem({ school: university })] : [];

  // Extract company/org names — look for "at Company" or "@Company" patterns in visible text
  const companyRe = /(?:at|@)\s+([A-Z][a-zA-Z0-9\s&.,]{2,40}?)(?:\s*[|·•\n<])/g;
  const companies: string[] = [];
  let m;
  while ((m = companyRe.exec(html)) !== null && companies.length < 6) {
    const c = m[1].trim();
    if (c.length > 2 && !c.match(/^(the|a|an|this|my|your)$/i)) companies.push(c);
  }
  const experience = companies.length > 0
    ? companies.map(company => normalizeExpItem({ company, title: "Role", description: `Worked at ${company}` }))
    : [];

  // Extract summary/about from meta description
  const metaDesc = html.match(/property=["']og:description["'][^>]+content=["']([^"']{20,500})["']/i)
    || html.match(/name=["']description["'][^>]+content=["']([^"']{20,500})["']/i);
  const summary = metaDesc ? metaDesc[1].trim() : "";

  return { fullName: name, firstName: name.split(" ")[0] || "", headline, avatar, summary, university, experience, education, skills, projects: [], volunteer: [], profileUrl, source: "html-fallback" };
}

export async function POST(req: Request) {
  try {
    const { profileUrl } = await req.json();

    if (!process.env.RAPIDAPI_KEY) {
      return Response.json({ error: "LinkedIn scraper API key is not configured" }, { status: 503 });
    }

    // Try fresh-linkedin-scraper first
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 9000);
      const result = await fetchFreshLinkedInProfile(profileUrl, ctrl.signal);
      clearTimeout(t);
      if (result) return Response.json(result);
    } catch (e) {
      console.warn("[fresh] failed:", e);
    }

    // Fallback: li-data-scraper
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 9000);
      const result = await fetchLinkedInEnricher(profileUrl, ctrl.signal);
      clearTimeout(t);
      if (result) return Response.json(result);
    } catch (e) {
      console.warn("[enricher] failed:", e);
    }

    // Last resort: raw HTML scrape
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(`https://ai-web-scraper1.p.rapidapi.com/`, {
        method: "POST",
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          "x-rapidapi-host": "ai-web-scraper1.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: profileUrl, summary: false }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      const text = await res.text();
      let data: Record<string, unknown>;
      try { data = JSON.parse(text); } catch { data = { html: text }; }

      if (data.html || (typeof text === "string" && text.includes("<!DOCTYPE"))) {
        return Response.json(parseLinkedInHTML((data.html as string) || text, profileUrl));
      }

      const normalized = normalizeLinkedInData(data, profileUrl);
      if (normalized) return Response.json(normalized);
    } catch (e) {
      console.warn("[html-scraper] failed:", e);
    }

    return Response.json({ error: "Profile scraping failed" }, { status: 503 });
  } catch (error) {
    console.error("Scraper error:", error);
    return Response.json({ error: "Profile scraping failed" }, { status: 500 });
  }
}
