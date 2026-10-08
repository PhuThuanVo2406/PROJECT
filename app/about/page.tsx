import type { Metadata } from "next";
import { ExternalLink, Flag, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us · HCC Study Buddy",
  description: "About College Project: Study Buddy, the Omega Sigma Chapter officers, and our community rules.",
};

const PTK_URL = "https://www.ptk.org/create-a-winning-college-project-plan/";
const INSTAGRAM_URL = "https://www.instagram.com/omega.sigma.ptk/";

// Copy below is used exactly as provided by the chapter. Do not edit wording.
const PROJECT_PARAGRAPHS = [
  "At Houston Community College, many students arrive for class, complete their coursework, and leave soon afterward. For students balancing work, family responsibilities, commuting, and demanding academic schedules, finding the time and confidence to build meaningful connections can be difficult. As a result, students may know the classrooms they attend, but not the people sitting beside them.",
  "This project was created in response to that everyday experience.",
  // The third paragraph contains the Phi Theta Kappa link and is rendered separately.
  "Our goal is not simply to organize another campus activity. We want to address a fundamental part of the college experience: belonging. A student who has someone to study with, someone to ask a question, or simply someone to say hello to may experience campus very differently from a student who feels completely alone.",
  "The project therefore focuses on creating opportunities for small, genuine interactions. Rather than relying on complicated technology or requiring students to make a major commitment, we aim to lower the barrier to connection and make it easier for students to take the first step toward meeting someone new. In doing so, we hope to help transform brief encounters on campus into meaningful relationships.",
  "This approach reflects the purpose of Phi Theta Kappa's College Project, which encourages chapters to work with their colleges to identify meaningful campus needs and develop projects that support the institution's mission and create positive change. PTK also emphasizes that successful College Projects should involve collaboration, leadership development, communication, and measurable outcomes.",
  "For the Omega Sigma Chapter, this project represents service in its most direct form: students identifying a challenge they experience themselves and working together to improve the experience of their peers. It gives PTK members an opportunity not only to serve, but also to practice leadership, teamwork, problem-solving, communication, and project development in a real campus setting. PTK describes leadership as something students do, and its College Project program is specifically designed to create positive impact through student leadership and collaboration with college administration.",
  "Most importantly, this project was built by students, for students.",
  "We understand that connection does not always require a large event, a formal organization, or a long conversation. Sometimes, it begins with one introduction, one shared question, or one invitation to study together. By creating more opportunities for those moments to happen, we hope to help students feel that they are not simply attending HCC, they are part of it.",
  "Our vision is simple: a campus where students have more opportunities to know one another, support one another, and feel that they belong.",
];

const OFFICERS = [
  {
    name: "Vincent Vo",
    title: "Chapter President",
    bio: "Vincent is a Mathematics major with a Data Science concentration at Houston Community College. With a strong interest in financial analysis and data-driven decision-making, Vincent is passionate about using mathematics and technology to solve complex problems. As Chapter President, he is committed to creating a supportive and engaged chapter community where every member feels heard, valued, and empowered to achieve their goals.",
  },
  {
    name: "Marleny Gomez Platero",
    title: "Vice President of Leadership",
    bio: "Marleny Gomez Platero serves as Vice President of Leadership for the Omega Sigma Chapter. A pre-med student at Houston Community College's Central Campus, she has a particular interest in neuroscience and enjoys exploring the intersection between science and art. Outside of academics, Marleny enjoys reading classic literature and relaxing with a good cup of coffee. As Vice President of Leadership, she looks forward to encouraging members to develop their leadership skills and discover opportunities for personal and professional growth.",
  },
  {
    name: "Isabel Steffek",
    title: "Vice President of Service",
    bio: "Isabel Steffek serves as Vice President of Service for the Omega Sigma Chapter at Houston Community College. She is a second-year pre-med student majoring in neuroscience and plans to attend medical school. Isabel enjoys reading, particularly fantasy fiction, listening to music, and volunteering at the Houston Museum of Natural Science. As Vice President of Service, she looks forward to creating meaningful opportunities for members to serve their community and make a positive impact.",
  },
  {
    name: "Angelina Olerynemzou",
    title: "Vice President of Scholarship",
    bio: "Angelina Olerynemzou serves as Vice President of Scholarship for the Omega Sigma Chapter for the 2026-2027 academic year. Originally from Gabon and Cameroon, she is a Biology major and returning International Student Ambassador. Her passion for healthcare and the human body drives her goal of pursuing a career in medicine. Outside of academics, Angelina enjoys dancing, spending time in the lab, learning new things, and helping others. As Vice President of Scholarship, she looks forward to helping members learn about the many scholarship opportunities available through Phi Theta Kappa and supporting their academic and personal growth throughout the year.",
  },
  {
    name: "Yunzhang Mu",
    title: "Vice President of Fellowship",
    bio: "Yunzhang Mu is a sophomore at Houston Community College majoring in Psychology and serves as Vice President of Fellowship for the Omega Sigma Chapter. Yunzhang is particularly interested in mental health, cross-cultural understanding, and helping others develop a healthy balance between their academic responsibilities and personal well-being. As Vice President of Fellowship, Yunzhang hopes to create opportunities that strengthen connections among members and contribute to a supportive and engaged chapter community.",
  },
];

type Rule = { n: number; lead: string; text: string };

const RULE_GROUPS: { heading: string; rules: Rule[] }[] = [
  {
    heading: "Privacy & Security",
    rules: [
      { n: 1, lead: "HCC students only", text: "Access is limited to currently enrolled Houston Community College students. Students must verify their account using an HCC email address." },
      { n: 2, lead: "We do not track your location", text: "The platform shows only whether you are available on a particular HCC campus. We do not use GPS, collect precise location data, or track where you move on or around campus." },
      { n: 3, lead: "We collect only what we need", text: "We collect the minimum information necessary to provide the service. We do not sell your personal information or share it with third parties for advertising or marketing purposes." },
      { n: 4, lead: "You control your visibility", text: "You decide whether you want to appear as available to other students. You can turn off your presence at any time and may request that your information be deleted." },
      { n: 5, lead: "Keep sensitive information private", text: "Never share your phone number, home address, passwords, financial information, or other sensitive personal information through the platform." },
      { n: 6, lead: "No system is completely secure", text: "We use reasonable safeguards to protect information, but no online system can guarantee complete security. If you notice suspicious activity, a security issue, or another problem, please report it as soon as possible." },
    ],
  },
  {
    heading: "Meeting Safely",
    rules: [
      { n: 7, lead: "Meet on campus and in public spaces", text: "If you choose to meet another student, meet only on an HCC campus and use public, well-trafficked spaces such as libraries, study rooms, student lounges, or other common areas. Do not arrange meetings through the platform at private residences or other off-campus locations." },
      { n: 8, lead: "You are always in control", text: "You never have to meet, respond to, or continue interacting with another student. You may decline an invitation or leave an interaction at any time. No explanation is required." },
      { n: 9, lead: "Let someone know", text: "When meeting someone new, consider telling a friend, classmate, or trusted person where you will be and who you are meeting." },
    ],
  },
  {
    heading: "Respect & Community Conduct",
    rules: [
      { n: 10, lead: "Treat others with respect", text: "Harassment, bullying, discrimination, hate speech, threats, intimidation, and unwanted contact are not permitted." },
      { n: 11, lead: "Be honest about who you are", text: "Use your real identity and do not impersonate another student or create an account intended to mislead others." },
      { n: 12, lead: "Keep the platform focused on student connection", text: "Spam, advertising, solicitation, scams, and promotional content are not permitted." },
      { n: 13, lead: "Block and report when necessary", text: "If another student makes you uncomfortable or violates these rules, use the available block and report features. Reports will be reviewed by the project team and may be referred to appropriate HCC personnel when necessary." },
      { n: 14, lead: "Violations may result in removal", text: "Students who violate these community rules may lose access to the platform and, when appropriate, may be referred to HCC officials or other relevant campus resources." },
    ],
  },
];

/** Instagram glyph drawn in the same stroke style as the site's lucide icons. */
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="stack-lg about">
      <header className="page-header animate-in">
        <div>
          <p className="eyebrow">About Us</p>
          <h1>College Project: Study Buddy</h1>
        </div>
      </header>

      {/* 1. About this project */}
      <section className="card about-section" aria-labelledby="about-project">
        <h2 id="about-project">About This Project</h2>
        <div className="about-prose">
          <p>{PROJECT_PARAGRAPHS[0]}</p>
          <p>{PROJECT_PARAGRAPHS[1]}</p>
          <p>
            Led by the{" "}
            <a href={PTK_URL} target="_blank" rel="noopener noreferrer">
              Phi Theta Kappa
              <span className="sr-only"> (opens in a new tab)</span>
            </a>{" "}
            Omega Sigma Chapter at Houston Community College, this student-led initiative aims to make meaningful peer
            connection a more natural part of campus life. The project provides students with a simple, accessible way
            to meet one another in person, discover common interests, find potential study partners, and develop
            relationships beyond the classroom.
          </p>
          {PROJECT_PARAGRAPHS.slice(2).map((text) => (
            <p key={text.slice(0, 32)}>{text}</p>
          ))}
        </div>
      </section>

      {/* 2. About us */}
      <section className="card about-section" aria-labelledby="about-us">
        <h2 id="about-us">About Us</h2>

        <img
          className="about-team-photo"
          src="/team/omega-sigma-officers-2026.jpg"
          alt="Omega Sigma Chapter officers, 2026-2027"
          loading="lazy"
          decoding="async"
          width={1400}
          height={1493}
        />

        <h3 className="about-subheading">Omega Sigma Chapter Officers, 2026-2027 Academic Year</h3>
        <ul className="officer-list">
          {OFFICERS.map((o) => (
            <li key={o.name} className="officer">
              <h4 className="officer-name">{o.name}</h4>
              <p className="officer-title">{o.title}</p>
              <p className="officer-bio">{o.bio}</p>
            </li>
          ))}
        </ul>

        {/* TODO(advisors): add the chapter advisors block here once advisors are confirmed. */}

        <p className="about-follow">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Omega Sigma Chapter on Instagram (opens in a new tab)"
          >
            <InstagramIcon />
            Follow @omega.sigma.ptk on Instagram
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </p>
      </section>

      {/* 3. Disclosure and community rules */}
      <section className="card about-section" aria-labelledby="about-rules">
        <h2 id="about-rules">Disclosure and Community Rules</h2>
        <p className="about-intro">
          This platform is designed to help HCC students connect with one another in a safe, respectful, and
          comfortable environment. By using the platform, students agree to follow the guidelines below.
        </p>

        {RULE_GROUPS.map((group) => (
          <div key={group.heading} className="rule-group">
            <h3 className="about-subheading">{group.heading}</h3>
            <ol className="rule-list" start={group.rules[0].n}>
              {group.rules.map((r) => (
                <li key={r.n}>
                  <strong>{r.lead}:</strong> {r.text}
                </li>
              ))}
            </ol>
          </div>
        ))}

        <div className="rule-group">
          <h3 className="about-subheading">Emergencies</h3>
          <p className="about-emergency">
            <ShieldAlert size={18} aria-hidden="true" />
            <span>
              This platform is not an emergency service. If you or someone else is in immediate danger, call 911 or
              contact HCC Police directly. For non-emergency concerns or community-rule violations, use the designated
              report option below.
            </span>
          </p>

          <div className="report-block" role="region" aria-labelledby="report-concern">
            <h4 id="report-concern">
              <Flag size={16} aria-hidden="true" />
              Report a concern
            </h4>
            {/*
              TODO(report contact): no project email or report form link has been provided yet.
              Add the official contact here (an email link or a form link). Do not use a personal email.
            */}
            <p className="muted">Report contact coming soon.</p>
          </div>
        </div>

        <footer className="about-meta">
          <p>Last updated: October 8, 2026</p>
          <p>Project team: Phi Theta Kappa Omega Sigma Chapter, Houston Community College</p>
        </footer>
      </section>
    </div>
  );
}
