import React from "react";
import path from "node:path";
import ReactPDF, {
  Document,
  Font,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { RichText } from "../richText";
import {
  IResumeTemplateProps,
  ResumeData,
  ResumeLink,
  ResumeSection,
  WorkExperienceSection,
  EducationSection,
  SkillsSection,
  SkillsGroupedSection,
  ProjectsSection,
  CertificatesSection,
  SummarySection,
  LanguagesSection,
  WorkExperienceItem,
  EducationItem,
} from "../../types/resumeTypes";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: path.resolve(__dirname, "../../assets/fonts/Inter-Regular.ttf"),
      fontWeight: 400,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Inter-Medium.ttf"),
      fontWeight: 500,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Inter-Bold.ttf"),
      fontWeight: 700,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Inter-Italic.ttf"),
      fontStyle: "italic",
      fontWeight: 400,
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

// ── Filled icons wrapped in circle borders ────────────────────────────────────

function IconInCircle({ type, size = 8 }: { type: string; size?: number }) {
  const c = "#333";
  const diameter = size + 6;
  const radius = diameter / 2;

  let path: React.ReactNode = null;

  switch (type) {
    case "linkedin":
      path = (
        <Path
          fill={c}
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        />
      );
      break;
    case "email":
      path = (
        <Path
          fill={c}
          d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
        />
      );
      break;
    case "phone":
      path = (
        <Path
          fill={c}
          d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
        />
      );
      break;
    case "address":
      path = (
        <Path
          fill={c}
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
        />
      );
      break;
    case "github":
      path = (
        <Path
          fill={c}
          d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
        />
      );
      break;
    case "website":
    case "portfolio":
      path = (
        <Path
          fill={c}
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
        />
      );
      break;
    default:
      break;
  }

  if (!path) return null;

  return (
    <View
      style={{
        width: diameter,
        height: diameter,
        borderRadius: radius,
        borderWidth: 1,
        borderColor: "#555",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 5,
      }}
    >
      <Svg viewBox="0 0 24 24" width={size} height={size}>
        {path}
      </Svg>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 40,
    paddingRight: 40,
    backgroundColor: "#ffffff",
  },
  // ── Header ──────────────────────────────────────────────
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 11,
    color: "#555",
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    marginBottom: 3,
  },
  contactText: {
    fontSize: 8.5,
    color: "#333",
  },
  headerDivider: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#666",
    marginBottom: 0,
  },
  // ── Two-column body ──────────────────────────────────────
  body: {
    flexDirection: "row",
    flex: 1,
  },
  leftCol: {
    width: "58%",
    paddingRight: 16,
    paddingTop: 10,
  },
  rightCol: {
    width: "42%",
    paddingLeft: 16,
    paddingTop: 10,
    borderLeftWidth: 0,
  },
  // ── Section header ───────────────────────────────────────
  sectionBlock: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#111",
    textAlign: "center",
    marginBottom: 4,
  },
  sectionRule: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#666",
    paddingVertical: 1, // gap above and below text
    marginBottom: 8,
  },
  // ── Summary ──────────────────────────────────────────────
  summaryText: {
    fontSize: 9,
    color: "#333",
    lineHeight: 1.55,
    marginBottom: 5,
    textAlign: "justify",
  },
  // ── Work Experience ──────────────────────────────────────
  itemBlock: { marginBottom: 10 },
  itemRole: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 1,
  },
  itemCompany: {
    fontSize: 9,
    color: "#333",
    marginBottom: 1,
  },
  itemDateLoc: {
    fontSize: 8.5,
    color: "#555",
    marginBottom: 4,
  },
  // ── Education ────────────────────────────────────────────
  eduDegree: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 1,
  },
  eduInstitution: {
    fontSize: 9,
    color: "#333",
    marginBottom: 1,
  },
  eduDateLoc: {
    fontSize: 8.5,
    color: "#555",
    marginBottom: 6,
  },
  // ── Skills (described) ───────────────────────────────────
  skillName: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 1,
  },
  skillDesc: {
    fontSize: 8.5,
    color: "#555",
    lineHeight: 1.4,
    marginBottom: 6,
  },
  // ── Bullet list (languages, certs) ───────────────────────
  bullet: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 2,
  },
  bulletDot: {
    fontSize: 9,
    color: "#444",
    marginRight: 5,
    lineHeight: 1.5,
  },
  bulletText: {
    fontSize: 9,
    color: "#222",
    flex: 1,
    lineHeight: 1.45,
  },
  // ── Skills flat (two-col if columns layout) ──────────────
  twoColWrap: { flexDirection: "row", flexWrap: "wrap" },
  twoColItem: { flexDirection: "row", width: "50%", marginBottom: 3 },
  twoColDot: { fontSize: 9, color: "#444", marginRight: 5, lineHeight: 1.5 },
  twoColText: { fontSize: 9, color: "#222", flex: 1 },
  // ── Projects ─────────────────────────────────────────────
  projectName: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 1,
  },
  projectMeta: {
    fontSize: 8.5,
    color: "#555",
    marginBottom: 3,
  },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={S.sectionRule}>
      <Text style={S.sectionTitle}>{title}</Text>
    </View>
  );
}

function BulletList({ bullets }: { bullets: string[] }) {
  return (
    <>
      {bullets.map((b, i) => (
        <View key={i} style={S.bullet} wrap={false}>
          <Text style={S.bulletDot}>•</Text>
          <RichText style={S.bulletText}>{b}</RichText>
        </View>
      ))}
    </>
  );
}

// ── Section renderers ─────────────────────────────────────────────────────────

function renderSummary(section: SummarySection) {
  // Summary may contain multiple paragraphs separated by \n
  const paragraphs = section.text.split("\n").filter(Boolean);
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {paragraphs.map((p, i) => (
        <RichText key={i} style={S.summaryText}>
          {p}
        </RichText>
      ))}
    </View>
  );
}

function renderWorkExperience(section: WorkExperienceSection) {
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {section.items.map((item: WorkExperienceItem) => (
        <View key={item.id} style={S.itemBlock} wrap={false}>
          <Text style={S.itemRole}>{item.role}</Text>
          <Text style={S.itemCompany}>{item.company}</Text>
          <Text style={S.itemDateLoc}>
            {item.start_date} – {item.is_current ? "Present" : item.end_date}
            {item.location ? ` | ${item.location}` : ""}
          </Text>
          <BulletList bullets={item.bullets} />
        </View>
      ))}
    </View>
  );
}

function renderEducation(section: EducationSection) {
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {section.items.map((item: EducationItem) => (
        <View key={item.id} wrap={false}>
          <Text style={S.eduDegree}>{item.degree}</Text>
          <Text style={S.eduInstitution}>{item.institution}</Text>
          <Text style={S.eduDateLoc}>
            {item.start_date}
            {item.end_date ? ` – ${item.end_date}` : ""}
            {item.location ? ` | ${item.location}` : ""}
          </Text>
          <BulletList bullets={item.bullets} />
        </View>
      ))}
    </View>
  );
}

function renderSkills(section: SkillsSection) {
  // All layouts render as bullet list in this template
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {section.items.map((item, i) => (
        <View key={i} style={S.bullet} wrap={false}>
          <Text style={S.bulletDot}>•</Text>
          <Text style={S.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function renderSkillsGrouped(section: SkillsGroupedSection) {
  // Render each group as: bold label + description text
  // (groups with a single item are treated as described skills)
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {section.groups.map((group, i) => (
        <View key={i} wrap={false}>
          <Text style={S.skillName}>{group.label}</Text>
          <Text style={S.skillDesc}>{group.items.join(", ")}</Text>
        </View>
      ))}
    </View>
  );
}

function renderProjects(section: ProjectsSection) {
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {section.items.map((item) => (
        <View key={item.id} style={S.itemBlock} wrap={false}>
          <Text style={S.projectName}>{item.name}</Text>
          {item.tech_stack && item.tech_stack.length > 0 && (
            <Text style={S.projectMeta}>{item.tech_stack.join(" · ")}</Text>
          )}
          <BulletList bullets={item.bullets} />
        </View>
      ))}
    </View>
  );
}

function renderCertificates(section: CertificatesSection) {
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {section.items.map((item) => (
        <View key={item.id} style={S.bullet} wrap={false}>
          <Text style={S.bulletDot}>•</Text>
          <Text style={S.bulletText}>{item.name}</Text>
        </View>
      ))}
    </View>
  );
}

function renderLanguages(section: LanguagesSection) {
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {section.items.map((item, i) => (
        <View key={i} style={S.bullet} wrap={false}>
          <Text style={S.bulletDot}>•</Text>
          <Text style={S.bulletText}>{item.name}</Text>
        </View>
      ))}
    </View>
  );
}

function renderSection(section: ResumeSection) {
  switch (section.type) {
    case "summary":
      return renderSummary(section);
    case "work_experience":
      return renderWorkExperience(section);
    case "education":
      return renderEducation(section);
    case "skills":
      return renderSkills(section);
    case "skills_grouped":
      return renderSkillsGrouped(section);
    case "projects":
      return renderProjects(section);
    case "certificates":
      return renderCertificates(section);
    case "languages":
      return renderLanguages(section);
    default:
      return null;
  }
}

// ── Template Component ────────────────────────────────────────────────────────

function ResumeTemplate6({ resumeData }: IResumeTemplateProps) {
  const data: ResumeData = JSON.parse(resumeData);
  const { header, sections } = data;

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  // Default column by section type — override with explicit column field in JSON
  const DEFAULT_RIGHT = new Set([
    "education",
    "skills",
    "skills_grouped",
    "certificates",
    "languages",
  ]);
  const resolveColumn = (s: ResumeSection): "left" | "right" => {
    if (s.column) return s.column;
    return DEFAULT_RIGHT.has(s.type) ? "right" : "left";
  };

  const leftSections = sorted.filter((s) => resolveColumn(s) === "left");
  const rightSections = sorted.filter((s) => resolveColumn(s) === "right");

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <Text style={S.name}>{header.name}</Text>
        {header.title && <Text style={S.headerTitle}>{header.title}</Text>}

        {/* Contact row with circled icons */}
        {header.links.length > 0 && (
          <View style={S.contactRow}>
            {header.links.map((link: ResumeLink) => (
              <View key={link.type} style={S.contactItem}>
                <IconInCircle type={link.type} size={8} />
                <Text style={S.contactText}>{link.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* <View style={S.headerDivider} /> */}

        {/* Two-column body */}
        <View style={S.body}>
          <View style={S.leftCol}>
            {leftSections.map((section) => renderSection(section))}
          </View>
          <View style={S.rightCol}>
            {rightSections.map((section) => renderSection(section))}
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default async (data: IResumeTemplateProps) => {
  return await ReactPDF.renderToStream(<ResumeTemplate6 {...data} />);
};
