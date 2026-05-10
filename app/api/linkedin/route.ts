import { getAvatarUrl } from "@/lib/profile-utils";

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return "";
}

function firstArray(...values: unknown[]) {
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0) return value;
  }

  return [];
}

function normalizeLinkedInData(raw: any, profileUrl: string) {
  const data = raw?.data && typeof raw.data === "object" ? raw.data : raw;
  if (!data || typeof data !== "object") return null;

  const fullName = firstString(
    data.fullName,
    data.full_name,
    data.name,
    data.title,
    [data.firstName, data.lastName].filter(Boolean).join(" "),
    [data.first_name, data.last_name].filter(Boolean).join(" ")
  );
  const headline = firstString(data.headline, data.head_line, data.tagline, data.subtitle, data.occupation);
  const avatar = getAvatarUrl(data);
  const experience = firstArray(data.position, data.positions, data.experience, data.experiences, data.workExperience, data.jobs, data.employments);
  const education = firstArray(data.education, data.educations, data.schools, data.school);
  const skills = firstArray(data.skills, data.topSkills, data.skill, data.skillEndorsements);
  const projects = firstArray(data.projects, data.project, data.certifications, data.publications);

  if (!fullName && !headline && !avatar && experience.length === 0 && education.length === 0 && skills.length === 0) {
    return null;
  }

  return {
    ...data,
    fullName,
    firstName: firstString(data.firstName, data.first_name, fullName.split(" ")[0]),
    headline,
    avatar,
    profileUrl,
    experience,
    education,
    skills,
    projects,
    university: firstString(data.university, data.school, data.schoolName),
    source: data.source || "rapidapi-linkedin",
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
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        "x-rapidapi-host": "fresh-linkedin-scraper-api.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      signal,
    }
  );

  const text = await response.text();
  let data: any;

  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }

  if (!response.ok || data?.success === false || data?.error) {
    return null;
  }

  console.log("[linkedin] fresh API raw keys:", Object.keys(data?.data ?? data ?? {}));
  const normalized = normalizeLinkedInData(data, profileUrl);
  if (normalized) {
    console.log("[linkedin] normalized exp/edu/skills counts:", normalized.experience.length, normalized.education.length, normalized.skills.length);
  }
  return normalized ? { ...normalized, username, source: "rapidapi-fresh-linkedin" } : null;
}

async function fetchLinkedInEnricher(profileUrl: string, signal: AbortSignal) {
  const response = await fetch(
    `https://li-data-scraper.p.rapidapi.com/get-profile-data-by-url?url=${encodeURIComponent(profileUrl)}`,
    {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
        "x-rapidapi-host": "li-data-scraper.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      signal,
    }
  );

  const text = await response.text();
  let data: any;

  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }

  if (!response.ok || data?.success === false || data?.error || data?.message?.includes("no longer")) {
    return null;
  }

  return normalizeLinkedInData(data, profileUrl);
}

function parseLinkedInHTML(html: string) {
  // Extract name from title or h1
  const nameMatch = html.match(/<title>([^|]+)\s*\|\s*LinkedIn/i) || html.match(/<h1[^>]*>([^<]+)/i);
  const name = nameMatch ? nameMatch[1].trim() : "";

  // Extract headline
  const headlineMatch = html.match(/<div[^>]*class="[^"]*text-body-medium[^"]*"[^>]*>([^<]+)/i);
  const headline = headlineMatch ? headlineMatch[1].trim() : "";

  // Extract avatar URL
  const avatarMatch =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+name=["']image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<img[^>]+class=["'][^"']*(?:profile-photo|profile-picture|presence-entity__image)[^"']*["'][^>]+src=["']([^"']+)["']/i) ||
    html.match(/<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*(?:profile-photo|profile-picture|presence-entity__image)[^"']*["']/i);
  const avatar = avatarMatch ? avatarMatch[1] : "";

  // Extract experience count - look for job titles and company patterns
  const experienceMatches = html.match(/(?:at|@|employed|worked)\s+[A-Z][^<,\n]+(Inc|Corp|Ltd|Company|LLC|Tech|Solutions|Services|Group|Partners|Labs)?/gi) || [];
  const expMatches = html.match(/experience|employment|work history/gi) || [];
  const experienceCount = Math.min(Math.max(Math.floor((experienceMatches.length + expMatches.length) / 2), 0), 20);

  // Extract education count and university name - improved patterns
  const educationMatch = html.match(/([A-Z][a-zA-Z\s]*(?:University|College|Institute|Academy|School|Polytechnic)[a-zA-Z\s]*)/i);
  const university = educationMatch ? educationMatch[1].trim() : "";
  const degreeMatches = html.match(/(?:bachelor|master|phd|associate|diploma|certificate|degree|b\.?s\.?|m\.?s\.?|m\.?a\.?|b\.?a\.?)/gi) || [];
  const eduMatches = html.match(/education|university|college|degree/gi) || [];
  const educationCount = Math.min(Math.max(Math.floor((degreeMatches.length + eduMatches.length) / 2), university ? 1 : 0), 5);

  // Extract skills count - more comprehensive tech/business skills
  const skillPatterns = /(?:Python|JavaScript|Java|C\+\+|React|Node|AWS|SQL|HTML|CSS|TypeScript|Git|Docker|Kubernetes|MongoDB|PostgreSQL|GraphQL|Angular|Vue|Swift|Kotlin|Go|Rust|PHP|Ruby|Scala|Flutter|TensorFlow|PyTorch|Linux|Azure|GCP|Firebase|Redis|Elasticsearch|Jenkins|CI\/CD|Agile|Scrum|Figma|Sketch|Photoshop|Illustrator|Excel|Tableau|PowerBI|Salesforce|HubSpot|SAP|Jira|Confluence|Slack|Notion|Express|Spring|Django|FastAPI|Flask|API|REST|Microservices|Serverless|Dataflow|Spark|Hadoop|Kafka|AWS Lambda|Stripe|Webflow)/gi;
  const skillMatches = html.match(skillPatterns) || [];
  const skillsCount = Math.min(skillMatches.length, 30);

  // Build realistic data objects for scoring
  const experience = experienceCount > 0
    ? Array(experienceCount).fill(null).map((_, i) => ({ title: `Job ${i+1}` }))
    : [];

  const education = educationCount > 0
    ? Array(educationCount).fill(null).map((_, i) => ({ school: university || `School ${i+1}` }))
    : [];

  const skills = skillsCount > 0
    ? Array(skillsCount).fill(null).map((_, i) => ({ skill: `Skill ${i+1}` }))
    : [];

  return {
    fullName: name,
    firstName: name.split(' ')[0] || "",
    headline: headline,
    avatar: avatar,
    university: university,
    experience,
    education,
    skills,
    parsed: true
  };
}

export async function POST(req: Request) {
  try {
    const { profileUrl } = await req.json();

    if (!process.env.RAPIDAPI_KEY) {
      return Response.json(
        { error: "LinkedIn scraper API key is not configured" },
        { status: 503 }
      );
    }

    try {
      const freshController = new AbortController();
      const freshTimeout = setTimeout(() => freshController.abort(), 8000);
      const freshProfile = await fetchFreshLinkedInProfile(profileUrl, freshController.signal);
      clearTimeout(freshTimeout);
      if (freshProfile) {
        return Response.json(freshProfile);
      }
    } catch (error) {
      console.warn("Fresh LinkedIn scraper failed, falling back:", error);
    }

    try {
      const enricherController = new AbortController();
      const enricherTimeout = setTimeout(() => enricherController.abort(), 8000);
      const enriched = await fetchLinkedInEnricher(profileUrl, enricherController.signal);
      clearTimeout(enricherTimeout);
      if (enriched) {
        return Response.json(enriched);
      }
    } catch (error) {
      console.warn("LinkedIn enricher failed, falling back:", error);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `https://ai-web-scraper1.p.rapidapi.com/`,
      {
        method: "POST",
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          "x-rapidapi-host": "ai-web-scraper1.p.rapidapi.com",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: profileUrl,
          summary: false
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    const result = await response.text();
    let data;

    try {
      data = JSON.parse(result);
    } catch {
      // If parsing fails, treat as raw HTML
      data = { html: result };
    }

    // Check if API returned an error
    if (data.error || data.message?.includes("error")) {
      return Response.json(
        { error: data.error || data.message || "Scraper API error" },
        { status: 503 }
      );
    }

    // Parse HTML if that's what we got
    if (data.html || (typeof data === 'string' && data.includes('<!DOCTYPE'))) {
      const html = data.html || data;
      const parsedData = parseLinkedInHTML(html);
      return Response.json(parsedData);
    }

    return Response.json({
      ...data,
      avatar: getAvatarUrl(data),
    });
  } catch (error) {
    console.error("Scraper API Error:", error);

    return Response.json(
      { error: "Profile scraping failed" },
      { status: 500 }
    );
  }
}
