import React from "react";
import path from "node:path";
import ReactPDF, {
  Document,
  Font,
  Image,
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
  family: "Carlito",
  fonts: [
    {
      src: path.resolve(__dirname, "../../assets/fonts/Carlito-Regular.ttf"),
      fontWeight: 400,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Carlito-Bold.ttf"),
      fontWeight: 700,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Carlito-Italic.ttf"),
      fontStyle: "italic",
      fontWeight: 400,
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const NAVY = "#033055";

const S = StyleSheet.create({
  page: {
    fontFamily: "Carlito",
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
    marginBottom: 16,
  },
  photo: {
    width: 78,
    height: 84,
    marginRight: 18,
    borderRadius: 2,
    objectFit: "cover",
  },
  headerInfo: { flex: 1, justifyContent: "flex-start" },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: NAVY,
    letterSpacing: 0.5,
    marginBottom: 7,
  },
  contactGrid: { flexDirection: "column" },
  contactRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  contactLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
    width: 52,
  },
  contactColon: {
    fontSize: 10,
    color: "#555",
    marginRight: 4,
  },
  contactValue: {
    fontSize: 10,
    color: "#333",
    flex: 1,
  },
  // ── Section ──────────────────────────────────────────────
  sectionBlock: { marginBottom: 10 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: NAVY,
    marginBottom: 3,
  },
  sectionRule: {
    borderBottomWidth: 1,
    borderBottomColor: NAVY,
    marginBottom: 6,
  },
  // ── Summary ──────────────────────────────────────────────
  summaryText: {
    fontSize: 11,
    color: "#111",
    lineHeight: 1.55,
    textAlign: "justify",
  },
  // ── Work Experience ──────────────────────────────────────
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111",
    flex: 1,
  },
  itemDate: {
    fontSize: 10,
    color: "#111",
    fontWeight: "bold",
  },
  itemSub: {
    fontSize: 10,
    color: "#333",
    marginBottom: 4,
  },
  itemBlock: { marginBottom: 8 },
  // ── Bullets ──────────────────────────────────────────────
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 10,
    color: "#444",
    marginRight: 5,
    lineHeight: 1.5,
  },
  bulletText: {
    fontSize: 11,
    color: "#111",
    flex: 1,
    lineHeight: 1.45,
    textAlign: "justify",
  },
  // ── Skills flat ──────────────────────────────────────────
  skillsWrap: { flexDirection: "row", flexWrap: "wrap" },
  skillCell: { flexDirection: "row", width: "50%", marginBottom: 3 },
  skillDot: { fontSize: 10, color: "#444", marginRight: 5, lineHeight: 1.5 },
  skillText: { fontSize: 10, color: "#333" },
  // ── Skills grouped (Additional Information style) ─────────
  groupRow: { flexDirection: "row", marginBottom: 3, flexWrap: "wrap" },
  groupLabel: { fontSize: 11, fontWeight: "bold", color: "#111" },
  groupValue: { fontSize: 11, color: "#111", flex: 1, lineHeight: 1.4 },
  // ── Certificates ─────────────────────────────────────────
  certRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  certName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111",
    flex: 1,
  },
  certDate: { fontSize: 10, color: "#111" },
  certIssuer: { fontSize: 10, color: "#333", marginBottom: 5 },
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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
          <RichText style={S.bulletText}>{b}</RichText>
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
      <RichText style={S.summaryText}>{section.text}</RichText>
    </View>
  );
}

function renderWorkExperience(section: WorkExperienceSection) {
  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {section.items.map((item: WorkExperienceItem, i, arr) => (
        <View
          key={item.id}
          style={{ marginBottom: i < arr.length - 1 ? 10 : 0 }}
        >
          <View style={S.itemRow} wrap={false}>
            <Text style={S.itemTitle}>
              {item.role}, {item.company}
            </Text>
            <Text style={S.itemDate}>
              {item.start_date} - {item.is_current ? "Present" : item.end_date}
            </Text>
          </View>
          {item.location && <Text style={S.itemSub}>{item.location}</Text>}
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
      {section.items.map((item: EducationItem, i, arr) => (
        <View
          key={item.id}
          style={{ marginBottom: i < arr.length - 1 ? 10 : 0 }}
        >
          <View style={S.itemRow} wrap={false}>
            <Text style={S.itemTitle}>{item.degree}</Text>
            <Text style={S.itemDate}>
              {item.start_date} - {item.is_current ? "Present" : item.end_date}
            </Text>
          </View>
          <Text style={S.itemSub}>
            {item.institution}
            {item.location ? `  |  ${item.location}` : ""}
          </Text>
          <BulletList bullets={item.bullets} />
        </View>
      ))}
    </View>
  );
}

function renderSkills(section: SkillsSection) {
  if (section.layout === "list") {
    return (
      <View key={section.id} style={S.sectionBlock}>
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

  return (
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      <View style={S.skillsWrap}>
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
    <View key={section.id} style={S.sectionBlock}>
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
    <View key={section.id} style={S.sectionBlock}>
      <SectionHeader title={section.title} />
      {section.items.map((item, i, arr) => (
        <View
          key={item.id}
          style={{ marginBottom: i < arr.length - 1 ? 10 : 0 }}
        >
          <View style={S.itemRow} wrap={false}>
            <Text style={S.itemTitle}>{item.name}</Text>
            {(item.start_date || item.end_date) && (
              <Text style={S.itemDate}>
                {item.start_date}
                {item.end_date ? ` – ${item.end_date}` : ""}
              </Text>
            )}
          </View>
          {item.tech_stack && item.tech_stack.length > 0 && (
            <Text style={S.itemSub}>{item.tech_stack.join(", ")}</Text>
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
        <View key={item.id} style={{ marginBottom: 6 }} wrap={false}>
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

function ResumeTemplate4({ resumeData }: IResumeTemplateProps) {
  const data: ResumeData = JSON.parse(resumeData);
  const { header, sections } = data;

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.headerRow}>
          {header.photo_url && <Image src={header.photo_url} style={S.photo} />}
          <View style={S.headerInfo}>
            <Text style={S.name}>{header.name.toUpperCase()}</Text>
            <View style={S.contactGrid}>
              {header.links.map((link) => (
                <View key={link.type} style={S.contactRow}>
                  <Text style={S.contactLabel}>
                    {capitalizeFirst(link.type)}
                  </Text>
                  <Text style={S.contactColon}>:</Text>
                  <Text style={S.contactValue}>{link.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Sections */}
        {sortedSections.map((section) => renderSection(section))}
      </Page>
    </Document>
  );
}

export default async (data: IResumeTemplateProps) => {
  return await ReactPDF.renderToStream(<ResumeTemplate4 {...data} />);
};
