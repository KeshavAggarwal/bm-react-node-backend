import React from "react";
import ReactPDF, {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
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

// Lato — distinctive light/bold contrast for the mixed-weight name
Font.register({
  family: "Lato",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh7USSwaPGQ3q5d0.ttf",
      fontWeight: 300,
    },
    {
      src: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHjx4wXiWtFCc.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/lato/v24/S6u9w4BMUTPHh6UVSwaPGQ3q5d0.ttf",
      fontWeight: 700,
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const S = StyleSheet.create({
  page: {
    fontFamily: "Lato",
    paddingTop: 36,
    paddingBottom: 36,
    paddingLeft: 40,
    paddingRight: 40,
    backgroundColor: "#ffffff",
  },
  // ── Header ──────────────────────────────────────────────
  header: { alignItems: "center", marginBottom: 6 },
  nameRow: { flexDirection: "row", justifyContent: "center", marginBottom: 4 },
  nameLight: { fontSize: 30, fontWeight: 300, color: "#555", letterSpacing: 0.5 },
  nameBold: { fontSize: 30, fontWeight: 700, color: "#222", letterSpacing: 0.5 },
  contactLine: { fontSize: 8.5, color: "#444", textAlign: "center", marginBottom: 2 },
  headerRule: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#222",
    marginTop: 6,
    marginBottom: 12,
  },
  // ── Two-column body ──────────────────────────────────────
  body: { flexDirection: "row" },
  leftCol: { width: "37%", paddingRight: 14 },
  rightCol: {
    width: "63%",
    paddingLeft: 14,
    borderLeftWidth: 0.5,
    borderLeftColor: "#ccc",
  },
  // ── Section ──────────────────────────────────────────────
  sectionBlock: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 400,
    color: "#333",
    letterSpacing: 2,
    marginBottom: 2,
  },
  sectionRule: { borderBottomWidth: 0.5, borderBottomColor: "#bbb", marginBottom: 6 },
  // ── Work / Education ─────────────────────────────────────
  itemTopRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 1 },
  itemCompany: { fontSize: 9.5, fontWeight: 700, color: "#111" },
  itemSep: { fontSize: 9.5, color: "#666", marginHorizontal: 3 },
  itemRole: { fontSize: 9, fontWeight: 400, color: "#333", letterSpacing: 0.5 },
  itemDateLine: { fontSize: 8.5, color: "#555", marginBottom: 4 },
  itemBlock: { marginBottom: 9 },
  // ── Bullets ──────────────────────────────────────────────
  bullet: { flexDirection: "row", marginBottom: 2, paddingLeft: 2 },
  bulletDot: { fontSize: 8.5, color: "#444", marginRight: 5, lineHeight: 1.5 },
  bulletText: { fontSize: 8.5, color: "#222", flex: 1, lineHeight: 1.45 },
  // ── Skills flat / list ───────────────────────────────────
  skillItem: { fontSize: 8.5, color: "#333", lineHeight: 1.5 },
  // ── Skills grouped ───────────────────────────────────────
  groupBlock: { marginBottom: 6 },
  groupLabel: { fontSize: 8.5, fontWeight: 700, color: "#222", marginBottom: 2 },
  groupItem: { fontSize: 8.5, color: "#333", lineHeight: 1.45, paddingLeft: 4 },
  // ── Certificates (used for Awards) ───────────────────────
  awardRow: { flexDirection: "row", marginBottom: 3 },
  awardYear: { fontSize: 8.5, color: "#444", width: 28 },
  awardRank: { fontSize: 8.5, color: "#444", width: 52, fontWeight: 700 },
  awardName: { fontSize: 8.5, color: "#222", flex: 1, lineHeight: 1.4 },
  // ── Summary ──────────────────────────────────────────────
  summaryText: { fontSize: 8.5, color: "#333", lineHeight: 1.5, textAlign: "justify" },
  // ── Projects ─────────────────────────────────────────────
  projectName: { fontSize: 9.5, fontWeight: 700, color: "#111" },
  projectMeta: { fontSize: 8.5, color: "#555", marginBottom: 3 },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <>
      <Text style={S.sectionTitle}>{title.toUpperCase()}</Text>
      <View style={S.sectionRule} />
    </>
  );
}

function BulletList({ bullets }: { bullets: string[] }) {
  return (
    <>
      {bullets.map((b, i) => (
        <View key={i} style={S.bullet} wrap={false}>
          <Text style={S.bulletDot}>•</Text>
          <Text style={S.bulletText}>{b}</Text>
        </View>
      ))}
    </>
  );
}

// ── Section renderers ─────────────────────────────────────────────────────────

function renderSummary(section: SummarySection) {
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      <Text style={S.summaryText}>{section.text}</Text>
    </View>
  );
}

function renderWorkExperience(section: WorkExperienceSection) {
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {section.items.map((item: WorkExperienceItem) => (
        <View key={item.id} style={S.itemBlock} wrap={false}>
          <View style={S.itemTopRow}>
            <Text style={S.itemCompany}>{item.company.toUpperCase()}</Text>
            <Text style={S.itemSep}>|</Text>
            <Text style={S.itemRole}>{item.role.toUpperCase()}</Text>
          </View>
          <Text style={S.itemDateLine}>
            {item.start_date} – {item.is_current ? "Present" : item.end_date}
            {item.location ? `  |  ${item.location}` : ""}
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
        <View key={item.id} style={S.itemBlock} wrap={false}>
          <Text style={S.itemCompany}>{item.institution}</Text>
          <Text style={S.itemRole}>{item.degree}</Text>
          <Text style={S.itemDateLine}>
            {item.end_date || item.start_date}
            {item.location ? `  |  ${item.location}` : ""}
          </Text>
          <BulletList bullets={item.bullets} />
        </View>
      ))}
    </View>
  );
}

function renderSkills(section: SkillsSection) {
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {section.items.map((item, i) => (
        <Text key={i} style={S.skillItem}>
          {item}
        </Text>
      ))}
    </View>
  );
}

function renderSkillsGrouped(section: SkillsGroupedSection) {
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {section.groups.map((group, i) => (
        <View key={i} style={S.groupBlock} wrap={false}>
          <Text style={S.groupLabel}>{group.label.toUpperCase()}</Text>
          {group.items.map((item, j) => (
            <Text key={j} style={S.groupItem}>
              {item}
            </Text>
          ))}
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
        <View key={item.id} style={S.awardRow} wrap={false}>
          <Text style={S.awardYear}>{item.date}</Text>
          <Text style={S.awardRank}>{item.issuer}</Text>
          <Text style={S.awardName}>{item.name}</Text>
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
        <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }} wrap={false}>
          <Text style={[S.skillItem, { width: 60 }]}>{item.name}</Text>
          <View style={{ flexDirection: "row" }}>
            {Array.from({ length: 5 }).map((_, j) => (
              <View
                key={j}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: j < item.level ? "#333" : "#ccc",
                  marginRight: j < 4 ? 3 : 0,
                }}
              />
            ))}
          </View>
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

function ResumeTemplate3({ resumeData }: IResumeTemplateProps) {
  const data: ResumeData = JSON.parse(resumeData);
  const { header, sections } = data;

  const sorted = [...sections].sort((a, b) => a.order - b.order);

  // Default column by section type — override with explicit column field in JSON
  const DEFAULT_RIGHT = new Set([
    "work_experience",
    "projects",
    "certificates",
    "languages",
  ]);
  const resolveColumn = (s: ResumeSection): "left" | "right" => {
    if (s.column) return s.column;
    return DEFAULT_RIGHT.has(s.type) ? "right" : "left";
  };

  const leftSections = sorted.filter((s) => resolveColumn(s) === "left");
  const rightSections = sorted.filter((s) => resolveColumn(s) === "right");

  // Split name: first words in light, last word in bold
  const nameParts = header.name.trim().split(" ");
  const lastWord = nameParts.pop() || "";
  const firstPart = nameParts.join(" ");

  const contactLines = header.links.map((l) => l.label);
  const mid = Math.ceil(contactLines.length / 2);
  const contactRow1 = contactLines.slice(0, mid).join("  |  ");
  const contactRow2 = contactLines.slice(mid).join("  |  ");

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <View style={S.nameRow}>
            {firstPart ? (
              <Text style={S.nameLight}>{firstPart} </Text>
            ) : null}
            <Text style={S.nameBold}>{lastWord}</Text>
          </View>
          {contactRow1 ? (
            <Text style={S.contactLine}>{contactRow1}</Text>
          ) : null}
          {contactRow2 ? (
            <Text style={S.contactLine}>{contactRow2}</Text>
          ) : null}
        </View>
        <View style={S.headerRule} />

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
  return await ReactPDF.renderToStream(<ResumeTemplate3 {...data} />);
};
