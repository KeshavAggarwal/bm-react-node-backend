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
  WorkExperienceItem,
  EducationItem,
} from "../../types/resumeTypes";

Font.register({
  family: "Lato",
  fonts: [
    {
      src: path.resolve(__dirname, "../../assets/fonts/Lato-Regular.ttf"),
      fontWeight: 400,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Lato-Bold.ttf"),
      fontWeight: 700,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Lato-Italic.ttf"),
      fontStyle: "italic",
      fontWeight: 400,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Lato-BoldItalic.ttf"),
      fontStyle: "italic",
      fontWeight: 700,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Lato-Black.ttf"),
      fontWeight: 900,
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const S = StyleSheet.create({
  page: {
    fontFamily: "Lato",
    paddingTop: 42,
    paddingBottom: 42,
    paddingLeft: 50,
    paddingRight: 50,
    backgroundColor: "#ffffff",
  },
  // ── Header ──────────────────────────────────────────────
  name: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 2.5,
    color: "#111",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 10,
    textAlign: "center",
    color: "#555",
    letterSpacing: 0.5,
    marginBottom: 7,
  },
  contactLine: {
    fontSize: 8.5,
    textAlign: "center",
    color: "#555",
    marginBottom: 13,
  },
  headerDivider: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#bbb",
    marginBottom: 14,
  },
  // ── Section ──────────────────────────────────────────────
  sectionBox: {
    backgroundColor: "#D7E0E7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 9,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#1a1a1a",
    letterSpacing: 0.8,
  },
  sectionGap: { marginBottom: 10 },
  // ── Summary ──────────────────────────────────────────────
  summaryText: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: "#333",
    textAlign: "justify",
  },
  // ── Work / Education items ───────────────────────────────
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  itemCompany: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111",
    flex: 1,
  },
  itemDate: {
    fontSize: 9,
    color: "#555",
    fontWeight: "bold",
  },
  itemRole: {
    fontSize: 9.5,
    fontStyle: "italic",
    color: "#444",
    marginBottom: 5,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 6,
  },
  bulletDot: {
    fontSize: 9,
    color: "#555",
    marginRight: 5,
    lineHeight: 1.55,
  },
  bulletText: {
    fontSize: 9,
    color: "#333",
    flex: 1,
    lineHeight: 1.45,
    textAlign: "justify",
  },
  // ── Skills flat ──────────────────────────────────────────
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillCell: {
    flexDirection: "row",
    width: "33.33%",
    marginBottom: 5,
  },
  skillDot: {
    fontSize: 9,
    color: "#555",
    marginRight: 5,
    lineHeight: 1.5,
  },
  skillText: {
    fontSize: 9,
    color: "#333",
  },
  // ── Skills grouped ───────────────────────────────────────
  groupRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  groupLabel: {
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#333",
    width: 90,
  },
  groupItems: {
    fontSize: 9.5,
    color: "#333",
    flex: 1,
    lineHeight: 1.4,
  },
  // ── Projects ─────────────────────────────────────────────
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  projectName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111",
    flex: 1,
  },
  projectMeta: {
    fontSize: 9,
    color: "#555",
    fontStyle: "italic",
    marginBottom: 4,
  },
  // ── Certificates ─────────────────────────────────────────
  certHeader: {
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
  certDate: {
    fontSize: 9,
    color: "#555",
  },
  certIssuer: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 5,
  },
});

// ── Renderers ────────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={S.sectionBox}>
      <Text style={S.sectionTitle}>{title.toUpperCase()}</Text>
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
      {section.items.map((item: WorkExperienceItem, i, arr) => (
        <View
          key={item.id}
          style={{ marginBottom: i < arr.length - 1 ? 10 : 0 }}
        >
          <View style={S.itemHeader} wrap={false}>
            <Text style={S.itemCompany}>{item.company}</Text>
            <Text style={S.itemDate}>
              {item.start_date} – {item.is_current ? "Present" : item.end_date}
            </Text>
          </View>
          <Text style={S.itemRole}>{item.role}</Text>
          <BulletList bullets={item.bullets} />
        </View>
      ))}
    </View>
  );
}

function renderEducation(section: EducationSection) {
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      {section.items.map((item: EducationItem, i, arr) => (
        <View
          key={item.id}
          style={{ marginBottom: i < arr.length - 1 ? 10 : 0 }}
        >
          <View style={S.itemHeader} wrap={false}>
            <Text style={S.itemCompany}>{item.institution}</Text>
            <Text style={S.itemDate}>
              {item.start_date} – {item.is_current ? "Present" : item.end_date}
            </Text>
          </View>
          <Text style={S.itemRole}>{item.degree}</Text>
          <BulletList bullets={item.bullets} />
        </View>
      ))}
    </View>
  );
}

function renderSkills(section: SkillsSection) {
  if (section.layout === "list") {
    return (
      <View key={section.id} style={S.sectionGap}>
        <SectionHeader title={section.title} />
        {section.items.map((skill, i) => (
          <View key={i} style={S.bullet}>
            <Text style={S.bulletDot}>•</Text>
            <Text style={S.bulletText}>{skill}</Text>
          </View>
        ))}
      </View>
    );
  }

  // columns (default) — 3 per row
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      <View style={S.skillsRow}>
        {section.items.map((skill, i) => (
          <View key={i} style={S.skillCell}>
            <Text style={S.skillDot}>•</Text>
            <Text style={S.skillText}>{skill}</Text>
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
          <Text style={S.groupLabel}>{group.label}:</Text>
          <Text style={S.groupItems}>{group.items.join(", ")}</Text>
        </View>
      ))}
    </View>
  );
}

function renderProjects(section: ProjectsSection) {
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      {section.items.map((item, i, arr) => (
        <View
          key={item.id}
          style={{ marginBottom: i < arr.length - 1 ? 10 : 0 }}
        >
          <View style={S.projectHeader} wrap={false}>
            <Text style={S.projectName}>{item.name}</Text>
            {(item.start_date || item.end_date) && (
              <Text style={S.itemDate}>
                {item.start_date}
                {item.end_date ? ` – ${item.end_date}` : ""}
              </Text>
            )}
          </View>
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
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      {section.items.map((item) => (
        <View key={item.id} style={{ marginBottom: 6 }} wrap={false}>
          <View style={S.certHeader}>
            <Text style={S.certName}>{item.name}</Text>
            {item.date && <Text style={S.certDate}>{item.date}</Text>}
          </View>
          {item.issuer && <Text style={S.certIssuer}>{item.issuer}</Text>}
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
    default:
      return null;
  }
}

// ── Template Component ────────────────────────────────────────────────────────

function ResumeTemplate1({ resumeData }: IResumeTemplateProps) {
  const data: ResumeData = JSON.parse(resumeData);
  const { header, sections } = data;

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  const contactText = header.links.map((l) => l.label).join("  |  ");

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <Text style={S.name}>{header.name.toUpperCase()}</Text>
        {header.title && <Text style={S.headerTitle}>{header.title}</Text>}
        {header.links.length > 0 && (
          <Text style={S.contactLine}>{contactText}</Text>
        )}
        <View style={S.headerDivider} />

        {/* Sections */}
        {sortedSections.map((section) => renderSection(section))}
      </Page>
    </Document>
  );
}

export default async (data: IResumeTemplateProps) => {
  return await ReactPDF.renderToStream(<ResumeTemplate1 {...data} />);
};
