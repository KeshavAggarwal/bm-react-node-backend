import React from "react";
import path from "node:path";
import ReactPDF, {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { RichText } from "../richText";
import {
  IResumeTemplateProps,
  ResumeData,
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
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1MmgVxFIzIFKw.ttf",
      fontStyle: "italic",
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const GREEN = "#2d5a3d";
const NAVY = "#1c2533";

// ── Styles ────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    paddingTop: 44,
    paddingBottom: 44,
    paddingLeft: 52,
    paddingRight: 52,
    backgroundColor: "#ffffff",
  },
  // ── Header ──────────────────────────────────────────────
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: NAVY,
    letterSpacing: 1,
    marginBottom: 6,
  },
  headerRule: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#999",
    marginBottom: 6,
  },
  contactLine: {
    fontSize: 9,
    color: "#444",
    marginBottom: 14,
  },
  // ── Section headers ──────────────────────────────────────
  sectionBlock: { marginBottom: 10 },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: GREEN,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionRule: {
    borderBottomWidth: 0.6,
    borderBottomColor: "#aaa",
    marginBottom: 8,
  },
  sectionGap: { marginBottom: 13 },
  // ── Summary ──────────────────────────────────────────────
  summaryText: {
    fontSize: 9.5,
    color: "#333",
    lineHeight: 1.55,
    textAlign: "justify",
  },
  // ── Work experience ──────────────────────────────────────
  itemHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  itemCompany: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#111",
    flex: 1,
  },
  itemDate: {
    fontSize: 9,
    // fontStyle: "italic",
    color: "#444",
    marginLeft: 8,
  },
  itemRole: {
    fontSize: 9,
    color: "#444",
    marginBottom: 5,
  },
  itemBlock: { marginBottom: 12 },
  // ── Two-column bullets ───────────────────────────────────
  twoColBullets: { flexDirection: "row" },
  bulletCol: { width: "50%" },
  bulletColLeft: { paddingRight: 10 },
  bulletColRight: { paddingLeft: 2 },
  bullet: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bulletDot: {
    fontSize: 9,
    color: "#333",
    marginRight: 5,
    lineHeight: 1.5,
  },
  bulletText: {
    fontSize: 9,
    color: "#222",
    flex: 1,
    lineHeight: 1.45,
    textAlign: "justify",
  },
  // ── Education ────────────────────────────────────────────
  eduInstitution: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#111",
    flex: 1,
  },
  eduDegree: {
    fontSize: 9,
    color: "#333",
    marginBottom: 2,
  },
  eduExtra: {
    fontSize: 9,
    color: "#555",
    marginBottom: 2,
  },
  // ── Skills ───────────────────────────────────────────────
  groupRow: {
    flexDirection: "row",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  groupLabel: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#222",
  },
  groupValue: {
    fontSize: 9.5,
    color: "#333",
    flex: 1,
    lineHeight: 1.4,
  },
  // ── Certificates ─────────────────────────────────────────
  certRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  certName: { fontSize: 9.5, fontWeight: "bold", color: "#111", flex: 1 },
  certDate: { fontSize: 8.5, color: "#555" },
  certIssuer: { fontSize: 9, color: "#555", marginBottom: 4 },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={S.sectionBlock}>
      <Text style={S.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={S.sectionRule} />
    </View>
  );
}

// Splits bullets into two columns: first half left, second half right
function TwoColBullets({ bullets }: { bullets: string[] }) {
  if (bullets.length === 0) return null;
  const mid = Math.ceil(bullets.length / 2);
  const left = bullets.slice(0, mid);
  const right = bullets.slice(mid);

  return (
    <View style={S.twoColBullets}>
      <View style={[S.bulletCol, S.bulletColLeft]}>
        {left.map((b, i) => (
          <View key={i} style={S.bullet}>
            <Text style={S.bulletDot}>•</Text>
            <RichText style={S.bulletText}>{b}</RichText>
          </View>
        ))}
      </View>
      <View style={[S.bulletCol, S.bulletColRight]}>
        {right.map((b, i) => (
          <View key={i} style={S.bullet}>
            <Text style={S.bulletDot}>•</Text>
            <RichText style={S.bulletText}>{b}</RichText>
          </View>
        ))}
      </View>
    </View>
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
        <View key={item.id} style={S.itemBlock} wrap={false}>
          <View style={S.itemHeaderRow}>
            <Text style={S.itemCompany}>
              {item.company}
              {item.location ? `, ${item.location}` : ""}
            </Text>
            <Text style={S.itemDate}>
              {item.start_date}
              {item.is_current
                ? "–Present"
                : item.end_date
                  ? `–${item.end_date}`
                  : ""}
            </Text>
          </View>
          <Text style={S.itemRole}>{item.role}</Text>
          <TwoColBullets bullets={item.bullets} />
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
        <View key={item.id} style={{ marginBottom: 10 }} wrap={false}>
          <View style={S.itemHeaderRow}>
            <Text style={S.eduInstitution}>
              {item.institution}
              {item.location ? `, ${item.location}` : ""}
            </Text>
            <Text style={S.itemDate}>{item.end_date || item.start_date}</Text>
          </View>
          <Text style={S.eduDegree}>{item.degree}</Text>
          {item.bullets.map((line, i) => (
            <Text key={i} style={S.eduExtra}>
              {line}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function renderSkills(section: SkillsSection) {
  // Render as two-column bullets regardless of layout field
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      <TwoColBullets bullets={section.items} />
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
        <View key={item.id} style={S.itemBlock} wrap={false}>
          <View style={S.itemHeaderRow}>
            <Text style={S.itemCompany}>{item.name}</Text>
            {(item.start_date || item.end_date) && (
              <Text style={S.itemDate}>
                {item.start_date}
                {item.end_date ? `–${item.end_date}` : ""}
              </Text>
            )}
          </View>
          {item.tech_stack && item.tech_stack.length > 0 && (
            <Text style={S.itemRole}>{item.tech_stack.join(" · ")}</Text>
          )}
          <TwoColBullets bullets={item.bullets} />
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
  // Render as two-column plain text (no dots in this template style)
  const items = section.items.map((l) => l.name);
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      <TwoColBullets bullets={items} />
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

function ResumeTemplate8({ resumeData }: IResumeTemplateProps) {
  const data: ResumeData = JSON.parse(resumeData);
  const { header, sections } = data;

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const contactText = header.links.map((l) => l.label).join("  •  ");

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <Text style={S.name}>{header.name.toUpperCase()}</Text>
        <View style={S.headerRule} />
        <Text style={S.contactLine}>{contactText}</Text>

        {/* Sections */}
        {sortedSections.map((section) => renderSection(section))}
      </Page>
    </Document>
  );
}

export default async (data: IResumeTemplateProps) => {
  return await ReactPDF.renderToStream(<ResumeTemplate8 {...data} />);
};
