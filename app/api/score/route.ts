type UnknownRecord = Record<string, unknown>

interface ScoreCategory {
  label: string
  value: number
  max: number
  positive: boolean
  reason: string
  actionItems: ProfileChange[]
}

interface ProfileChange {
  section: string
  change: string
  example: string
  why: string
}

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function extractField(data: UnknownRecord, ...fieldNames: string[]): string {
  for (const name of fieldNames) {
    const value = data[name]
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  return ""
}

function extractArray(data: UnknownRecord, ...fieldNames: string[]): unknown[] {
  for (const name of fieldNames) {
    const value = data[name]
    if (Array.isArray(value) && value.length > 0) return value
  }

  return []
}

function textFrom(value: unknown): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.map(textFrom).filter(Boolean).join(" ")
  if (isRecord(value)) return Object.values(value).map(textFrom).filter(Boolean).join(" ")
  return ""
}

function itemField(item: unknown, ...keys: string[]): string {
  if (typeof item === "string") return item.trim()
  if (!isRecord(item)) return ""

  for (const key of keys) {
    const value = item[key]
    if (typeof value === "string" && value.trim()) return value.trim()
  }

  return ""
}

function clamp(value: number, max: number) {
  return Math.max(0, Math.min(max, Math.round(value)))
}

function hasAny(text: string, words: string[]) {
  const lower = text.toLowerCase()
  return words.some((word) => lower.includes(word))
}

function parseManualProfile(text: string) {
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean)
  const fullName = lines[0] || ""
  const profileText = lines.join("\n")
  const jobKeywords = ["engineer", "developer", "intern", "manager", "analyst", "consultant", "designer", "specialist", "coordinator"]
  const skillMatches = profileText.match(/(?:Python|JavaScript|Java|C\+\+|React|Node|AWS|SQL|HTML|CSS|TypeScript|Git|Docker|Kubernetes|MongoDB|PostgreSQL|GraphQL|Angular|Vue|Swift|Kotlin|Go|Rust|PHP|Ruby|TensorFlow|PyTorch|Linux|Azure|GCP|Firebase|Figma)/gi) || []

  return {
    fullName,
    firstName: fullName.split(" ")[0] || "",
    headline: lines.find((line) => jobKeywords.some((keyword) => line.toLowerCase().includes(keyword))) || "",
    experience: lines.filter((line) => jobKeywords.some((keyword) => line.toLowerCase().includes(keyword))).map((title) => ({ title })),
    education: lines.filter((line) => /university|college|bachelor|master|degree/i.test(line)).map((school) => ({ school })),
    skills: [...new Set(skillMatches)].map((name) => ({ name })),
    projects: lines.filter((line) => /project|built|created|launched|hackathon/i.test(line)).map((name) => ({ name })),
    manual: true,
  }
}

function getTier(aura: number) {
  if (aura >= 2000) return "Offer Magnet"
  if (aura >= 1600) return "FAANG Contender"
  if (aura >= 1200) return "Recruiter Bait"
  if (aura >= 800) return "New Grad Silver"
  if (aura >= 400) return "Internship Bronze"
  return "Resume Rookie"
}

const TECH_SKILLS_RE = /\b(Python|JavaScript|TypeScript|Java|C\+\+|C#|React|Next\.?js|Node\.?js|Vue|Angular|AWS|SQL|HTML|CSS|Git|Docker|Kubernetes|MongoDB|PostgreSQL|GraphQL|Swift|Kotlin|Go|Rust|PHP|Ruby|TensorFlow|PyTorch|Linux|Azure|GCP|Firebase|Redis|Figma|Supabase|Spring|Django|FastAPI|Flask|Express|Tailwind|REST|API|Agile|Scrum|CI\/CD|DevOps|Machine\s?Learning|Data\s?Science|Pandas|NumPy|Scikit|LangChain|HuggingFace|OpenCV|Spark|Kafka|Hadoop|Terraform|Ansible|Airflow|dbt|Tableau|Power\s?BI|Looker|Snowflake|Databricks|CUDA|Pytorch|JAX|Selenium|Playwright|Jest|Pytest|Vite|Webpack|tRPC|Prisma|Drizzle|Svelte|SolidJS|Remix|Astro)\b/gi

const BIG_COMPANIES = [
  // Big Tech
  "google", "microsoft", "amazon", "apple", "meta", "netflix", "nvidia", "salesforce", "oracle", "adobe",
  "spotify", "uber", "airbnb", "stripe", "openai", "anthropic", "shopify", "tesla", "intel", "ibm",
  // Consulting / Finance
  "deloitte", "mckinsey", "accenture", "pwc", "bain", "bcg", "kpmg", "ey", "ernst",
  "rbc", "td bank", "jpmorgan", "goldman", "morgan stanley", "blackrock", "citadel", "jane street",
  "two sigma", "de shaw", "d.e. shaw", "bridgewater", "point72", "millennium", "renaissance",
  "palantir", "bloomberg", "databricks", "snowflake", "coinbase",
  // VC / Startup prestige
  "sequoia", "a16z", "andreessen", "y combinator", "ycombinator", "yc ", "techstars", "general catalyst",
  // Other notable
  "twitter", "x.com", "tiktok", "bytedance", "samsung", "qualcomm", "arm", "amd", "cisco", "vmware",
]

const ELITE_SCHOOLS = [
  // Ivy+
  "harvard", "mit", "stanford", "yale", "princeton", "columbia", "upenn", "dartmouth", "brown", "cornell",
  // Top US
  "caltech", "uchicago", "duke", "johns hopkins", "carnegie mellon", "cmu", "northwestern", "vanderbilt",
  "michigan", "berkeley", "ucla", "georgia tech", "uiuc", "illinois", "ut austin", "purdue",
  "nyu", "georgetown", "rice", "notre dame",
  // Top Canada
  "toronto", "waterloo", "mcgill", "ubc", "alberta",
  // Top UK/EU
  "oxford", "cambridge", "imperial college", "ucl", "eth zurich", "epfl", "lse", "edinburgh",
  "ecole polytechnique", "hec paris", "delft",
  // Top Asia
  "nus", "ntu singapore", "iit ", "iit bombay", "iit delhi", "iit madras", "tsinghua", "peking", "kaist", "hkust",
  // Other globally recognized
  "melbourne", "sydney", "auckland",
]

function countTechSkills(text: string): number {
  return [...new Set((text.match(TECH_SKILLS_RE) || []).map(s => s.toLowerCase()))].length
}

function hasImpactMetric(text: string): boolean {
  return /\d+%|\d+x|\$[\d,.]+[km]?|\b[1-9]\d{2,}\s*(users|customers|requests|lines|downloads|installs|students|members|clients|transactions|hours)/i.test(text)
}

function detectCareerField(text: string): string {
  const lower = text.toLowerCase()
  if (/computer science|software engineering|web|frontend|backend|full-stack|full stack|developer|programming|data science|machine learning|artificial intelligence|cybersecurity/.test(lower)) return "software / tech"
  if (/finance|accounting|investment|banking|economics|business/.test(lower)) return "finance / business"
  if (/design|ux|ui|product design|graphic/.test(lower)) return "design"
  if (/biology|chemistry|biomedical|health|medical|nursing|pharmacy/.test(lower)) return "health / science"
  if (/mechanical|electrical|civil|chemical|industrial|mechatronics|engineering/.test(lower)) return "engineering"
  return "your target field"
}

function hasRelevantExperience(text: string): boolean {
  return /engineer|developer|software|data|analyst|research|designer|product|finance|accounting|marketing|consultant|cyber|machine learning|ai|laboratory|lab|intern|co-op|coop/i.test(text)
}

function hasLongTenure(text: string): boolean {
  return /\b(?:[5-9]|1\d|2\d)\+?\s*(?:years?|yrs?)\b/i.test(text)
}

function scoreHeadline(headline: string): ScoreCategory {
  if (!headline) return {
    label: "Headline clarity",
    value: 0,
    max: 250,
    positive: false,
    reason: "No headline found — recruiters lose the first-impression signal.",
    actionItems: [{
      section: "Headline",
      change: "Add a headline that says your target role, your strongest proof, and your current school/company. Do not use only 'Student' or 'Seeking opportunities'.",
      example: "Computer Science student | Full-stack developer building React + Node apps | Seeking 2026 software internships",
      why: "Recruiters scan the headline first. A clear role plus proof tells them where to place you immediately.",
    }],
  }
  const lower = headline.toLowerCase()
  let score = 80
  if (headline.length >= 40) score += 50
  else if (headline.length >= 25) score += 25
  // Seniority tiers — higher roles score more
  if (hasAny(headline, ["cto", "ceo", "coo", "vp ", "vice president", "director", "head of", "principal", "staff engineer", "distinguished"])) score += 90
  else if (hasAny(headline, ["lead", "senior", "architect", "manager", "founder", "cofounder", "co-founder"])) score += 70
  else if (hasAny(headline, ["engineer", "developer", "designer", "scientist", "researcher", "analyst"])) score += 60
  else if (hasAny(headline, ["intern", "student", "graduate", "junior", "associate"])) score += 35
  else if (hasAny(headline, ["seeking", "aspiring", "passionate", "enthusiast"])) score += 15
  // Entrepreneurial / builder signal
  if (hasAny(headline, ["building", "launching", "scaling", "creating", "started", "founded"])) score += 55
  if (countTechSkills(headline) > 0) score += 30
  if (BIG_COMPANIES.some(c => lower.includes(c))) score += 50
  if (ELITE_SCHOOLS.some(s => lower.includes(s))) score += 50

  const isElite = ELITE_SCHOOLS.some(s => lower.includes(s))
  const isBigCo = BIG_COMPANIES.some(c => lower.includes(c))

  return {
    label: "Headline clarity",
    value: clamp(score, 250),
    max: 250,
    positive: true,
    reason: isElite
      ? `Elite institution in headline — strong first-impression signal.`
      : isBigCo
        ? "Prestigious company in headline — recruiter attention captured."
        : "Your headline gives recruiters a quick signal about who you are.",
    actionItems: [
      {
        section: "Headline",
        change: "Rewrite the headline so it names one clear target role and one concrete proof point instead of a broad identity.",
        example: headline.length >= 40
          ? "Software Engineering student | Built 3 deployed React/Node projects | Interested in backend and AI systems"
          : "Software Engineering student | React, TypeScript, Python | Building deployed web apps",
        why: "Specific headlines beat generic ones because the reader can match you to a role in one pass.",
      },
    ],
  }
}

function scoreExperience(experience: unknown[], profileText: string): ScoreCategory {
  const structuredText = experience.map(textFrom).join(" ")
  const count = experience.length
  const text = structuredText || profileText
  const lower = text.toLowerCase()

  const relevant = hasRelevantExperience(text)
  const longTenure = hasLongTenure(text)
  const impactMetric = hasImpactMetric(text)

  let score = Math.min(240, count * 70)
  if (relevant) score += 180
  if (longTenure) score += 140
  // Seniority bonus for senior/leadership roles
  if (hasAny(lower, ["chief", "cto", "ceo", "coo", "vp ", "vice president", "director", "head of"])) score += 180
  else if (hasAny(lower, ["principal", "staff engineer", "distinguished", "architect", "quantitative researcher", "quant researcher"])) score += 130
  else if (hasAny(lower, ["senior", "lead ", "manager", "tech lead", "quant ", "quantitative analyst"])) score += 80

  // Entrepreneurial signal (no structured entries needed)
  if (count === 0) {
    const textJobHits = ["internship", "worked at", "software engineer", "developer at", "analyst at", "research assistant", "part-time", "full-time"].filter(w => lower.includes(w)).length
    score += textJobHits * 55
    if (hasAny(lower, ["building @", "building at", "founder @", "cofounder", "co-founder", "launching", "scaling", "founded"])) score += 130
  }

  // Prestige company anywhere in profile
  const bigCoMatches = BIG_COMPANIES.filter(c => lower.includes(c))
  if (bigCoMatches.length >= 2) score += 200
  else if (bigCoMatches.length === 1) score += 140

  // Research / academic signal
  if (hasAny(lower, ["research assistant", "research intern", "research engineer", "research scientist", "lab", "laboratory", "published", "arxiv", "ieee", "acm", "neurips", "icml", "cvpr", "iclr", "emnlp", "thesis", "dissertation"])) score += 100

  // Impact signals
  if (hasAny(lower, ["built", "launched", "shipped", "led", "automated", "increased", "reduced", "improved", "delivered", "deployed", "designed"])) score += 70
  if (impactMetric) score += 100

  if (count >= 4 && !relevant && !impactMetric) score -= 90

  return {
    label: "Experience signal",
    value: clamp(score, 650),
    max: 650,
    positive: count > 0 || score > 0,
    reason: count > 0
      ? `${count} position${count === 1 ? "" : "s"} found — score favors relevant depth, long tenure, seniority, prestige, and measurable impact over raw job count.`
      : score > 0
        ? "Some experience signals found in profile text, but no structured job entries were extracted."
        : "No work experience found in the profile data.",
    actionItems: [
      {
        section: "Experience",
        change: "For each role that connects to your major or target profession, add 2-4 bullets with action, tool, and measurable outcome. Put unrelated jobs lower and keep them short.",
        example: "Built an internal dashboard with React and SQL that reduced weekly reporting time by 35% for a 12-person operations team.",
        why: "A single deep, relevant role with outcomes is stronger than many unrelated job titles with no proof.",
      },
      {
        section: "Experience",
        change: "If you stayed in one relevant role for years, say the duration and progression clearly in the first bullet.",
        example: "Promoted from Junior Developer to Team Lead over 5 years while owning customer-facing inventory tools.",
        why: "Long-term relevant work shows trust, depth, and growth. The score now rewards that more than job hopping.",
      },
    ],
  }
}

function scoreEducation(education: unknown[], profileText: string): ScoreCategory {
  const structuredText = education.map(textFrom).join(" ")
  const count = education.length
  const text = (structuredText + " " + profileText).toLowerCase()

  const eliteMatch = ELITE_SCHOOLS.find(s => text.includes(s))
  let score = count > 0 ? 160 + Math.min(100, (count - 1) * 40) : 0

  if (eliteMatch) {
    // Elite school detected anywhere in the profile — strong signal
    score = Math.max(score, 220)
    score += 80
  } else if (count === 0 && /university|college|institute|bachelor|master|phd|b\.sc|m\.sc|b\.eng|m\.eng/.test(text)) {
    score += 140
  }

  if (/computer science|software engineering|information technology|data science|electrical engineering|cybersecurity|machine learning|artificial intelligence/.test(text)) score += 100
  else if (/engineering|mathematics|statistics|physics|applied math/.test(text)) score += 80
  else if (/business|economics|design|finance|bioinformatics|computational/.test(text)) score += 55

  if (/phd|doctorate|ph\.d/.test(text)) score += 90
  else if (/master|m\.sc|m\.eng|mba/.test(text)) score += 60
  else if (/bachelor|b\.sc|b\.eng|b\.s\b|b\.a\b/.test(text)) score += 30

  if (/gpa\s*[34]\.|dean|honor|distinction|scholarship|valedictorian|summa|magna|cum laude|first class|top of class/.test(text)) score += 60
  if (/research|thesis|dissertation|publication|published|nsf|nserc|nih|fellowship|grant/.test(text)) score += 50

  const detectedSchool = eliteMatch ? eliteMatch.charAt(0).toUpperCase() + eliteMatch.slice(1) : null

  return {
    label: "Education fit",
    value: clamp(score, 350),
    max: 350,
    positive: count > 0 || score > 0,
    reason: detectedSchool
      ? `${detectedSchool} detected — elite institution gives a significant score boost.`
      : count > 0
        ? "Education found — scored higher for relevant fields and advanced degrees."
        : score > 0
          ? "Education signals found in profile text."
          : "No education data found in the profile.",
    actionItems: [
      {
        section: "Education",
        change: "Add your exact degree, major, graduation year, and the coursework that matches your target role.",
        example: "B.Comp, Computer Science, University of Guelph, 2027 | Coursework: Data Structures, Databases, Software Design, Machine Learning",
        why: "Relevant education helps explain why your experience fits the profession instead of looking random.",
      },
    ],
  }
}

function scoreSkills(skills: unknown[], profileText: string): ScoreCategory {
  const names = skills.map((skill) => itemField(skill, "name", "title", "skill") || textFrom(skill)).filter(Boolean)
  const structuredText = names.join(" ")

  // Count tech skills from structured list, fall back to full text mining
  const structuredCount = countTechSkills(structuredText)
  const textCount = names.length === 0 ? countTechSkills(profileText) : 0
  const totalTechSkills = structuredCount + textCount
  const totalSkills = names.length || textCount

  let score = Math.min(220, totalSkills * 22)
  if (totalTechSkills >= 1) score += 80
  if (totalTechSkills >= 4) score += 70
  if (totalTechSkills >= 8) score += 60
  if (totalSkills >= 12) score += 50

  return {
    label: "Skills depth",
    value: clamp(score, 450),
    max: 450,
    positive: totalSkills > 0,
    reason: totalSkills > 0
      ? `${totalSkills} skill${totalSkills === 1 ? "" : "s"} detected (${totalTechSkills} technical) — extra credit scales with depth.`
      : "No skills found in the profile.",
    actionItems: [
      {
        section: "Skills",
        change: "Keep the skills list focused on tools you can defend in an interview. Prioritize 8-12 role-relevant skills over a long mixed list.",
        example: "Python, TypeScript, React, Node.js, SQL, PostgreSQL, Git, Docker, AWS",
        why: "Quality beats quantity here too. A focused stack reads stronger than dozens of unrelated keywords.",
      },
    ],
  }
}

function scoreSummary(summary: string): ScoreCategory {
  if (!summary || summary.length < 30) return {
    label: "About / Summary",
    value: 0,
    max: 200,
    positive: false,
    reason: "No about section found — add a summary to stand out.",
    actionItems: [{
      section: "About",
      change: "Add a 4-5 sentence About section: target role, relevant experience, strongest project/work proof, tools, and what you are looking for.",
      example: "I am a Computer Science student focused on full-stack software engineering. I build React, TypeScript, and Node.js apps, including a scheduling tool used by 120+ students. My strongest work is in turning messy workflows into clean products with measurable outcomes. I am looking for software internships where I can contribute to production web apps.",
      why: "The About section should connect the dots so your profile feels intentional, not like a list of disconnected activities.",
    }],
  }

  let score = 40
  if (summary.length > 150) score += 25
  if (summary.length > 400) score += 25
  if (countTechSkills(summary) >= 3) score += 40
  else if (countTechSkills(summary) >= 1) score += 20
  if (hasAny(summary, ["built", "created", "led", "shipped", "launched", "deployed", "published", "awarded", "won"])) score += 35
  if (hasAny(summary, ["github", "portfolio", "open source", "hackathon", "side project", "research", "publication", "paper"])) score += 35
  if (/\d+\s*(years?|months?)/i.test(summary)) score += 20
  if (/\d+%|\d+x|\$[\d,.]+|\b[1-9]\d{2,}\s*(users|customers)/i.test(summary)) score += 20

  return {
    label: "About / Summary",
    value: clamp(score, 200),
    max: 200,
    positive: score > 40,
    reason: score >= 120
      ? "Strong about section with concrete signals — recruiters can tell you apart from the crowd."
      : score >= 70
        ? "About section found — add outcomes, metrics, or tech details to boost this further."
        : "About section is present but light on specifics — add outcomes, projects, or tech details.",
    actionItems: [
      {
        section: "About",
        change: "Rewrite the About section around a focused professional story: target role, years/projects of experience, tools, and one measurable win.",
        example: "I am a software developer focused on full-stack products. I have built React and Node.js apps for student organizations and small teams, including a tool that cut manual scheduling work by 40%. I am strongest in TypeScript, SQL, and product-minded engineering.",
        why: "Specific outcomes make the profile credible and help the scanner see depth instead of filler.",
      },
    ],
  }
}

function scoreProjects(projects: unknown[], profileText: string): ScoreCategory {
  const structuredText = projects.map(textFrom).join(" ")
  const structuredCount = projects.length
  // Only scan profileText for project signals if no structured entries exist
  const searchText = structuredCount > 0 ? structuredText : profileText
  // Specific project/portfolio signals — not generic "built" which appears in experience
  const hasProjectSignal = hasAny(searchText, ["github.com", "portfolio", "hackathon", "open source", "side project", "personal project", "demo", "prototype"])
    || (structuredCount === 0 && hasAny(profileText, ["github", "leetcode", "devpost", "itch.io", "huggingface.co"]))
  let score = structuredCount * 90
  if (hasProjectSignal) score += 100
  if (hasAny(searchText, ["deployed", "production", "won", "award", "1st place", "prize", "published", "500+ stars", "starred"])) score += 90
  if (structuredCount > 0 && countTechSkills(structuredText) >= 3) score += 40

  return {
    label: "Projects proof",
    value: clamp(score, 300),
    max: 300,
    positive: structuredCount > 0 || hasProjectSignal,
    reason: structuredCount > 0
      ? `${structuredCount} project${structuredCount === 1 ? "" : "s"} found — awarded extra credit for shipped work and real impact.`
      : hasProjectSignal
        ? "Project/portfolio signals found — extra credit for deployed or awarded work."
        : "No project, portfolio, hackathon, or build signal found.",
    actionItems: [
      {
        section: "Featured / Projects",
        change: "Add 2-3 projects with a live link or GitHub link. Each project needs the problem, tech stack, what you personally built, and the result.",
        example: "RankedIn Aura Scanner - Built a Next.js app that analyzes LinkedIn profiles, scores experience quality, and stores leaderboard results with Supabase.",
        why: "Projects prove ability when work history is thin, and they show career relevance better than unrelated job volume.",
      },
    ],
  }
}

function scoreCompleteness(data: UnknownRecord, fullName: string, headline: string, avatar: string): ScoreCategory {
  const hasExperience = extractArray(data, "position", "fullPositions", "positions", "experience", "experiences", "workExperience", "jobs").length > 0
  const hasEducation = extractArray(data, "education", "educations", "schools", "school").length > 0
  const hasSkills = extractArray(data, "skills", "skill", "topSkills", "skillEndorsements").length > 0
  const hasSummary = Boolean(extractField(data, "summary", "about", "description", "bio"))

  const filled = [
    Boolean(fullName),
    Boolean(headline),
    Boolean(avatar),
    hasExperience,
    hasEducation,
    hasSkills,
    hasSummary,
  ].filter(Boolean).length

  return {
    label: "Profile completeness",
    value: clamp(Math.round((filled / 7) * 300), 300),
    max: 300,
    positive: filled >= 3,
    reason: `${filled}/7 profile sections found by the scanner.`,
    actionItems: [
      {
        section: "Profile basics",
        change: "Fill missing basics: real name, clear headshot, headline, About, Experience, Education, and Skills.",
        example: "Use a front-facing profile photo, a target-role headline, and complete dates/locations for experience and education.",
        why: "Incomplete profiles make strong achievements harder to trust because the reader has to guess too much.",
      },
    ],
  }
}

function scoreRecruiterSignal(categories: ScoreCategory[]): ScoreCategory {
  const weighted = categories.reduce((total, category) => total + category.value, 0)
  const score = weighted >= 1800 ? 150 : weighted >= 1300 ? 110 : weighted >= 850 ? 70 : weighted >= 450 ? 40 : 15

  return {
    label: "Recruiter signal",
    value: score,
    max: 150,
    positive: score >= 70,
    reason: "Overall impression bonus — how quickly a recruiter could shortlist this profile.",
    actionItems: [
      {
        section: "Whole profile",
        change: "Make the whole profile point at one professional direction. Remove or compress details that do not support the target role.",
        example: "If you want software roles, lead with software experience, technical projects, CS coursework, and a focused stack. Keep unrelated service jobs to one impact bullet.",
        why: "Recruiters reward a clear pattern. Depth in one relevant path beats a scattered profile with many unrelated entries.",
      },
    ],
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let linkedinData: UnknownRecord = isRecord(body.linkedinData) ? body.linkedinData : body

    if (linkedinData.manual && typeof linkedinData.profileText === "string") {
      linkedinData = parseManualProfile(linkedinData.profileText)
    }

    if (linkedinData.error) {
      return Response.json(
        { error: "LinkedIn data unavailable. Cannot analyze profile." },
        { status: 503 }
      )
    }

    const experience = extractArray(linkedinData, "position", "fullPositions", "positions", "experience", "experiences", "workExperience", "jobs", "employments")
    const education = extractArray(linkedinData, "education", "educations", "schools", "school")
    const skills = extractArray(linkedinData, "skills", "skill", "topSkills", "skillEndorsements")
    const projects = extractArray(linkedinData, "projects", "project", "publications", "certifications", "courses", "honors", "awards", "volunteerExperiences", "volunteer")
    const fullName = extractField(linkedinData, "fullName", "name", "firstName", "title")
    const headline = extractField(linkedinData, "headline", "head_line", "tagline")
    const avatar = extractField(linkedinData, "profilePicture", "profile_picture", "avatar", "imageUrl", "image", "photo")
    const summary = extractField(linkedinData, "summary", "about", "description", "bio")
    const profileText = textFrom(linkedinData)
    const careerField = detectCareerField(profileText)

    console.log("[score] exp:", experience.length, "edu:", education.length, "skills:", skills.length, "summary:", summary.length, "profileText:", profileText.length)

    const categories = [
      scoreHeadline(headline),
      scoreExperience(experience, profileText),
      scoreEducation(education, profileText),
      scoreSkills(skills, profileText),
      scoreSummary(summary),
      scoreProjects(projects, profileText),
      scoreCompleteness(linkedinData, fullName, headline, avatar),
    ]
    const fullBreakdown = [...categories, scoreRecruiterSignal(categories)]
    const aura = clamp(fullBreakdown.reduce((total, category) => total + category.value, 0), 2500)
    const tier = getTier(aura)
    const recruiterScore = clamp((aura / 2500) * 100, 100)

    const strengths = fullBreakdown
      .filter((category) => category.value >= category.max * 0.55)
      .slice(0, 3)
      .map((category) => `${category.label}: ${category.reason}`)
    const weakCategories = fullBreakdown
      .filter((category) => category.value < category.max * 0.35)
      .slice(0, 3)

    const priorityCategories = weakCategories.length > 0
      ? weakCategories
      : fullBreakdown
        .filter((category) => category.label !== "Recruiter signal")
        .sort((a, b) => (a.value / a.max) - (b.value / b.max))
        .slice(0, 3)

    const profileChanges = priorityCategories.flatMap((category) =>
      category.actionItems.map((item) => ({
        area: category.label,
        potentialGain: Math.max(40, category.max - category.value),
        ...item,
      }))
    )

    const improvements = weakCategories.length > 0 ? weakCategories.map((category) => ({
      area: category.label,
      suggestion: category.label === "Projects proof"
        ? `Add 2-3 ${careerField} projects with GitHub/live links, what you built, the stack, and the outcome.`
        : category.label === "Experience signal"
          ? `Rewrite experience around relevant ${careerField} depth: action, tools, duration, and measurable outcomes. Keep unrelated jobs short.`
          : category.label === "Skills depth"
            ? `Add a focused ${careerField} skills stack you can actually defend. Quality over quantity.`
            : category.label === "Headline clarity"
              ? `Write a clearer headline with your target ${careerField} role, strongest skill, and current status.`
              : "Fill out this section with concrete, recruiter-readable details and exact outcomes.",
      potentialGain: Math.max(40, category.max - category.value),
      changes: category.actionItems,
    })) : [{
      area: "Polish",
      suggestion: `Your profile has solid signal. Make it more focused on ${careerField}: add numbers, outcomes, and portfolio proof.`,
      potentialGain: 80,
      changes: profileChanges.slice(0, 3),
    }]

    const roasts = [
      aura >= 1800
        ? "This profile has real signal. The aura is not just vibes, the scanner found substance."
        : aura >= 1000
          ? "Decent profile. Not terrifying yet, but recruiters would not instantly close the tab."
          : "The aura is still loading. The profile needs more proof, more detail, and less mystery.",
      weakCategories[0]
        ? `${weakCategories[0].label} is holding the score back: ${weakCategories[0].reason}`
        : "Main weakness: the profile could still use sharper proof of impact.",
    ]

    const result = {
      aura,
      auraScore: aura,
      recruiterScore,
      rank: tier,
      tier,
      strengths: strengths.length > 0 ? strengths : ["The profile has a basic readable structure."],
      weaknesses: weakCategories.map((category) => `${category.label}: ${category.reason}`),
      roast: roasts[0],
      roasts,
      improvements,
      profileChanges,
      summary: `Profile scored ${aura.toLocaleString()}/2,500. ${tier} tier.`,
      breakdown: fullBreakdown.map((category) => ({
        label: category.label,
        value: category.value,
        max: category.max,
        positive: category.positive,
        reason: category.reason,
        actionItems: category.actionItems,
      })),
      jobMatches: [
        {
          title: "Software Engineer Intern",
          company: "Tech Company",
          match: Math.min(recruiterScore + 8, 95),
          reason: "Score is based on extracted experience, skills, projects, and education fit.",
        },
        {
          title: "Frontend Developer",
          company: "Startup",
          match: Math.min(recruiterScore + (hasAny(profileText, ["react", "javascript", "typescript", "next"]) ? 12 : 0), 92),
          reason: "Frontend fit improves when the profile shows web skills or shipped projects.",
        },
        {
          title: "Technical Analyst",
          company: "Enterprise",
          match: Math.min(recruiterScore + (hasAny(profileText, ["sql", "data", "analyst", "excel"]) ? 12 : 0), 90),
          reason: "Analyst fit improves when the profile shows data, tooling, or business context.",
        },
      ],
    }

    return Response.json(result)
  } catch (error) {
    console.error("AURA SCORE ERROR:", error)

    return Response.json(
      { error: "Profile analysis failed" },
      { status: 500 }
    )
  }
}
