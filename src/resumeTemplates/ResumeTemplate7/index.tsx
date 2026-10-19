import React from "react";
import path from "node:path";
import ReactPDF, {
  Document,
  Font,
  Image,
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
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf",
      fontWeight: "bold",
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

// ── Contact icons (filled, small) ─────────────────────────────────────────────

function ContactIcon({ type, size = 9 }: { type: string; size?: number }) {
  const c = "#555";
  switch (type) {
    case "email":
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            fill={c}
            d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
          />
        </Svg>
      );
    case "phone":
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            fill={c}
            d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
          />
        </Svg>
      );
    case "linkedin":
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            fill={c}
            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
          />
        </Svg>
      );
    case "address":
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            fill={c}
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
          />
        </Svg>
      );
    case "github":
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            fill={c}
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
          />
        </Svg>
      );
    case "website":
    case "portfolio":
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            fill={c}
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
          />
        </Svg>
      );
    default:
      return null;
  }
}

// ── Dot proficiency bar ───────────────────────────────────────────────────────

function DotRating({ level, max = 5 }: { level: number; max?: number }) {
  const DOT = 7;
  return (
    <View style={{ flexDirection: "row" }}>
      {Array.from({ length: max }).map((_, i) => (
        <View
          key={i}
          style={{
            width: DOT,
            height: DOT,
            borderRadius: DOT / 2,
            backgroundColor: i < level ? "#333" : "#ccc",
            marginRight: i < max - 1 ? 3 : 0,
          }}
        />
      ))}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 44,
    paddingRight: 44,
    backgroundColor: "#ffffff",
  },
  // ── Header ──────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 16,
  },
  headerInfo: { flex: 1 },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 10,
    color: "#666",
    marginBottom: 8,
  },
  contactGrid: { flexDirection: "column" },
  contactGridRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  contactCell: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
  },
  contactText: {
    fontSize: 8.5,
    color: "#444",
    marginLeft: 5,
  },
  // ── Section header band ───────────────────────────────────
  sectionBand: {
    backgroundColor: "#e8e8e8",
    paddingVertical: 5,
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111",
  },
  sectionGap: { marginBottom: 12 },
  // ── Summary ──────────────────────────────────────────────
  summaryText: {
    fontSize: 9,
    color: "#333",
    lineHeight: 1.55,
    textAlign: "justify",
  },
  // ── Work / Education: date-left layout ───────────────────
  splitRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  splitLeft: {
    width: "27%",
    paddingRight: 8,
  },
  splitRight: {
    width: "73%",
  },
  itemDate: {
    fontSize: 8.5,
    color: "#555",
    marginBottom: 2,
  },
  itemLocation: {
    fontSize: 8.5,
    color: "#666",
  },
  itemCompany: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 1,
  },
  itemRole: {
    fontSize: 9,
    color: "#444",
    marginBottom: 4,
  },
  eduDegree: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 1,
  },
  eduInstitution: {
    fontSize: 9,
    color: "#444",
  },
  // ── Bullets ──────────────────────────────────────────────
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
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
  // ── Skills 3-column ──────────────────────────────────────
  skillsWrap: { flexDirection: "row", flexWrap: "wrap" },
  skillCell: { flexDirection: "row", width: "33.33%", marginBottom: 4 },
  skillDot: { fontSize: 9, color: "#444", marginRight: 5, lineHeight: 1.5 },
  skillText: { fontSize: 9, color: "#222" },
  // ── Skills grouped ───────────────────────────────────────
  groupRow: { flexDirection: "row", marginBottom: 4, flexWrap: "wrap" },
  groupLabel: { fontSize: 9.5, fontWeight: "bold", color: "#222" },
  groupValue: { fontSize: 9.5, color: "#333", flex: 1, lineHeight: 1.4 },
  // ── Languages ────────────────────────────────────────────
  langWrap: { flexDirection: "row", flexWrap: "wrap" },
  langCell: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 6,
  },
  langName: {
    fontSize: 9,
    color: "#222",
    marginRight: 8,
    width: 60,
  },
  // ── Certificates ─────────────────────────────────────────
  certRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  certName: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#111",
    flex: 1,
  },
  certDate: { fontSize: 8.5, color: "#555" },
  certIssuer: { fontSize: 9, color: "#555", marginBottom: 5 },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={S.sectionBand}>
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
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      <RichText style={S.summaryText}>{section.text}</RichText>
    </View>
  );
}

function renderWorkExperience(section: WorkExperienceSection) {
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      {section.items.map((item: WorkExperienceItem) => (
        <View key={item.id} style={S.splitRow} wrap={false}>
          {/* Left: date + location */}
          <View style={S.splitLeft}>
            <Text style={S.itemDate}>
              {item.start_date} – {item.is_current ? "Present" : item.end_date}
            </Text>
            {item.location && (
              <Text style={S.itemLocation}>{item.location}</Text>
            )}
          </View>
          {/* Right: company, role, bullets */}
          <View style={S.splitRight}>
            <Text style={S.itemCompany}>{item.company}</Text>
            <Text style={S.itemRole}>{item.role}</Text>
            <BulletList bullets={item.bullets} />
          </View>
        </View>
      ))}
    </View>
  );
}

function renderEducation(section: EducationSection) {
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      {section.items.map((item: EducationItem) => (
        <View key={item.id} style={S.splitRow} wrap={false}>
          {/* Left: dates + location */}
          <View style={S.splitLeft}>
            <Text style={S.itemDate}>
              {item.start_date}
              {item.end_date ? ` – ${item.end_date}` : ""}
            </Text>
            {item.location && (
              <Text style={S.itemLocation}>{item.location}</Text>
            )}
          </View>
          {/* Right: degree, institution */}
          <View style={S.splitRight}>
            <Text style={S.eduDegree}>{item.degree}</Text>
            <Text style={S.eduInstitution}>{item.institution}</Text>
            <BulletList bullets={item.bullets} />
          </View>
        </View>
      ))}
    </View>
  );
}

function renderSkills(section: SkillsSection) {
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      <View style={S.skillsWrap}>
        {section.items.map((item, i) => (
          <View key={i} style={S.skillCell} wrap={false}>
            <Text style={S.skillDot}>•</Text>
            <Text style={S.skillText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderSkillsGrouped(section: SkillsGroupedSection) {
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      {section.groups.map((group, i) => (
        <View key={i} style={S.groupRow} wrap={false}>
          <Text style={S.groupLabel}>{group.label}: </Text>
          <Text style={S.groupValue}>{group.items.join(", ")}</Text>
        </View>
      ))}
    </View>
  );
}

function renderProjects(section: ProjectsSection) {
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      {section.items.map((item) => (
        <View key={item.id} style={S.splitRow} wrap={false}>
          <View style={S.splitLeft}>
            {(item.start_date || item.end_date) && (
              <Text style={S.itemDate}>
                {item.start_date}
                {item.end_date ? ` – ${item.end_date}` : ""}
              </Text>
            )}
          </View>
          <View style={S.splitRight}>
            <Text style={S.itemCompany}>{item.name}</Text>
            {item.tech_stack && item.tech_stack.length > 0 && (
              <Text style={S.itemRole}>{item.tech_stack.join(" · ")}</Text>
            )}
            <BulletList bullets={item.bullets} />
          </View>
        </View>
      ))}
    </View>
  );
}

function renderCertificates(section: CertificatesSection) {
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      {section.items.map((item) => (
        <View key={item.id} style={{ marginBottom: 5 }} wrap={false}>
          <View style={S.certRow}>
            <Text style={S.certName}>{item.name}</Text>
            {item.date && <Text style={S.certDate}>{item.date}</Text>}
          </View>
          {item.issuer && <Text style={S.certIssuer}>{item.issuer}</Text>}
        </View>
      ))}
    </View>
  );
}

function renderLanguages(section: LanguagesSection) {
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      <View style={S.langWrap}>
        {section.items.map((item, i) => (
          <View key={i} style={S.langCell} wrap={false}>
            <Text style={S.langName}>{item.name}</Text>
            <DotRating level={item.level} max={5} />
          </View>
        ))}
      </View>
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

function ResumeTemplate7({ resumeData }: IResumeTemplateProps) {
  const data: ResumeData = JSON.parse(resumeData);
  const { header, sections } = data;

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // 2×2 contact grid: first half left column, second half right column
  const mid = Math.ceil(header.links.length / 2);
  const leftLinks = header.links.slice(0, mid);
  const rightLinks = header.links.slice(mid);
  const rows = Math.max(leftLinks.length, rightLinks.length);

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.headerRow}>
          {header.photo_url && <Image src={header.photo_url} style={S.photo} />}
          <View style={S.headerInfo}>
            <Text style={S.name}>{header.name}</Text>
            {header.title && <Text style={S.headerTitle}>{header.title}</Text>}
            {header.links.length > 0 && (
              <View style={S.contactGrid}>
                {Array.from({ length: rows }).map((_, i) => (
                  <View key={i} style={S.contactGridRow}>
                    {leftLinks[i] && (
                      <View style={S.contactCell}>
                        <ContactIcon type={leftLinks[i].type} size={9} />
                        <Text style={S.contactText}>{leftLinks[i].label}</Text>
                      </View>
                    )}
                    {rightLinks[i] && (
                      <View style={S.contactCell}>
                        <ContactIcon type={rightLinks[i].type} size={9} />
                        <Text style={S.contactText}>{rightLinks[i].label}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Sections */}
        {sortedSections.map((section) => renderSection(section))}
      </Page>
    </Document>
  );
}

export default async (data: IResumeTemplateProps) => {
  return await ReactPDF.renderToStream(<ResumeTemplate7 {...data} />);
};
