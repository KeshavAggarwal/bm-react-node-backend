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
  family: "STIXTwoText",
  fonts: [
    {
      src: path.resolve(
        __dirname,
        "../../assets/fonts/STIXTwoText-Regular.ttf",
      ),
      fontWeight: 400,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/STIXTwoText-Medium.ttf"),
      fontWeight: 500,
    },
    {
      src: path.resolve(
        __dirname,
        "../../assets/fonts/STIXTwoText-SemiBold.ttf",
      ),
      fontWeight: 600,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/STIXTwoText-Bold.ttf"),
      fontWeight: 700,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/STIXTwoText-Italic.ttf"),
      fontStyle: "italic",
      fontWeight: 400,
    },
    {
      src: path.resolve(
        __dirname,
        "../../assets/fonts/STIXTwoText-MediumItalic.ttf",
      ),
      fontStyle: "italic",
      fontWeight: 500,
    },
  ],
});

Font.register({
  family: "Bitter",
  fonts: [
    {
      src: path.resolve(__dirname, "../../assets/fonts/Bitter-Regular.ttf"),
      fontWeight: 400,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Bitter-Medium.ttf"),
      fontWeight: 500,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Bitter-SemiBold.ttf"),
      fontWeight: 600,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Bitter-Bold.ttf"),
      fontWeight: 700,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/Bitter-Italic.ttf"),
      fontStyle: "italic",
      fontWeight: 400,
    },
    {
      src: path.resolve(
        __dirname,
        "../../assets/fonts/Bitter-MediumItalic.ttf",
      ),
      fontStyle: "italic",
      fontWeight: 500,
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

function LinkIcon({ type, size = 9 }: { type: string; size?: number }) {
  const color = "#333";

  switch (type) {
    case "phone":
      // Feather phone — stroke-based
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            stroke={color}
            strokeWidth={1.8}
            strokeLineCap="round"
            fill="none"
            d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.09 12.13a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1.4h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.07 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"
          />
        </Svg>
      );

    case "email":
      // Feather mail — stroke-based
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            stroke={color}
            strokeWidth={1.8}
            strokeLineCap="round"
            fill="none"
            d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
          />
          <Path
            stroke={color}
            strokeWidth={1.8}
            strokeLineCap="round"
            fill="none"
            d="M22 6L12 13 2 6"
          />
        </Svg>
      );

    case "linkedin":
      // Simple Icons LinkedIn — filled
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            fill={color}
            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
          />
        </Svg>
      );

    case "github":
      // Simple Icons GitHub — filled
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            fill={color}
            d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
          />
        </Svg>
      );

    case "behance":
      // Simple Icons Behance — filled
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            fill={color}
            d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.49.35-1.06.61-1.7.78-.63.17-1.3.25-2.006.25H0V4.51h6.938zm-.412 5.97c.584 0 1.06-.13 1.425-.4.36-.27.54-.7.54-1.28 0-.32-.06-.59-.18-.8a1.39 1.39 0 00-.48-.52 2.04 2.04 0 00-.696-.27 3.97 3.97 0 00-.84-.08H2.59v3.35h3.935zm.22 6.27c.32 0 .628-.03.92-.1.294-.07.55-.18.775-.33.224-.16.4-.36.528-.63.127-.26.19-.6.19-.99 0-.78-.22-1.35-.67-1.69-.45-.34-1.04-.51-1.77-.51H2.59v4.25h4.156zm11.45-5.67h-5.55c0-.67.22-1.2.65-1.59.44-.39.98-.58 1.63-.58.68 0 1.22.18 1.63.55.41.36.65.9.65 1.62zm2.6 3.98c-.37.48-.82.85-1.35 1.1-.53.26-1.12.39-1.77.39-.71 0-1.34-.12-1.89-.37-.55-.25-1.01-.6-1.38-1.04-.37-.44-.65-.96-.84-1.56-.19-.6-.28-1.26-.28-1.97 0-.7.1-1.35.3-1.96.2-.61.49-1.14.87-1.59.38-.45.85-.8 1.4-1.06.55-.26 1.18-.39 1.88-.39.74 0 1.38.14 1.91.41.53.27.97.63 1.32 1.08.35.44.6.96.76 1.54.16.58.24 1.19.24 1.83v.72h-8.08c0 .72.22 1.3.66 1.73.44.43 1.02.65 1.74.65.55 0 1.02-.12 1.41-.37.39-.25.7-.6.93-1.04l2.12 1.03zm-.36-10.12h-5.4V4.2h5.4v.73z"
          />
        </Svg>
      );

    case "website":
    case "portfolio":
      // Feather globe — stroke-based
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            stroke={color}
            strokeWidth={1.8}
            strokeLineCap="round"
            fill="none"
            d="M12 2a10 10 0 100 20A10 10 0 0012 2z"
          />
          <Path
            stroke={color}
            strokeWidth={1.8}
            strokeLineCap="round"
            fill="none"
            d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
          />
        </Svg>
      );

    case "address":
      // Feather map-pin — stroke-based
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            stroke={color}
            strokeWidth={1.8}
            strokeLineCap="round"
            fill="none"
            d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
          />
          <Path
            stroke={color}
            strokeWidth={1.8}
            strokeLineCap="round"
            fill="none"
            d="M12 13a3 3 0 100-6 3 3 0 000 6z"
          />
        </Svg>
      );

    default:
      return null;
  }
}

const S = StyleSheet.create({
  page: {
    fontFamily: "Bitter",
    paddingTop: 24,
    paddingBottom: 24,
    paddingLeft: 52,
    paddingRight: 52,
    backgroundColor: "#ffffff",
  },
  // ── Header ──────────────────────────────────────────────
  name: {
    fontFamily: "Bitter",
    fontSize: 24,
    fontWeight: "medium",
    textAlign: "center",
    letterSpacing: 1,
    color: "#111",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 0,
    marginBottom: 10,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
  },
  contactLabel: {
    fontSize: 8.5,
    color: "#111",
    marginLeft: 3,
  },
  contactSep: {
    fontSize: 8.5,
    color: "#999",
  },
  headerRule: {
    borderBottomWidth: 0.8,
    borderBottomColor: "#666",
    marginBottom: 12,
  },
  // ── Section header ───────────────────────────────────────
  sectionTitleRow: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontFamily: "Bitter",
    fontSize: 11,
    fontWeight: "semibold",
    color: "#111",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  sectionRule: {
    borderBottomWidth: 0.6,
    borderBottomColor: "#888",
  },
  sectionGap: { marginBottom: 10 },
  // ── Summary ──────────────────────────────────────────────
  summaryText: {
    fontSize: 9.5,
    lineHeight: 1.55,
    color: "#111",
    textAlign: "justify",
  },
  // ── Work / Education items ───────────────────────────────
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemCompany: {
    fontSize: 10,
    fontWeight: "semibold",
    color: "#111",
    flex: 1,
  },
  itemDateRange: {
    fontSize: 9,
    color: "#222",
    fontWeight: "semibold",
  },
  itemSubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  itemRole: {
    fontSize: 9.5,
    fontStyle: "italic",
    color: "#222",
    flex: 1,
  },
  itemLocation: {
    fontSize: 9,
    color: "#222",
    fontStyle: "italic",
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 9,
    color: "#222",
    marginRight: 6,
    lineHeight: 1.55,
  },
  bulletText: {
    fontSize: 10,
    color: "#111",
    flex: 1,
    lineHeight: 1.4,
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
    marginBottom: 4,
  },
  skillDot: {
    fontSize: 9,
    color: "#222",
    marginRight: 5,
    lineHeight: 1.5,
  },
  skillText: {
    fontSize: 10,
    color: "#111",
  },
  // ── Skills grouped — inline "Languages: Python, Java..." ─
  groupRow: {
    flexDirection: "row",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: "semibold",
    color: "#111",
  },
  groupItems: {
    fontSize: 10,
    color: "#111",
    flex: 1,
    lineHeight: 1.4,
  },
  // ── Projects ─────────────────────────────────────────────
  projectTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  projectName: {
    fontSize: 10,
    fontWeight: "semibold",
    color: "#111",
    flex: 1,
  },
  projectDate: {
    fontSize: 9,
    color: "#222",
  },
  projectStack: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#111",
    marginBottom: 4,
  },
  // ── Certificates ─────────────────────────────────────────
  certRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 1,
  },
  certName: {
    fontSize: 10,
    fontWeight: "semibold",
    color: "#111",
    flex: 1,
  },
  certDate: {
    fontSize: 9,
    color: "#222",
  },
  certIssuer: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#222",
    marginBottom: 2,
  },
});

// ── Renderers ────────────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={S.sectionTitleRow}>
      <Text style={S.sectionTitle}>{title}</Text>
      <View style={S.sectionRule} />
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
          <View style={S.itemTopRow} wrap={false}>
            <Text style={S.itemCompany}>{item.company}</Text>
            <Text style={S.itemDateRange}>
              {item.start_date} – {item.is_current ? "Present" : item.end_date}
            </Text>
          </View>
          <View style={S.itemSubRow} wrap={false}>
            <Text style={S.itemRole}>{item.role}</Text>
            {item.location && (
              <Text style={S.itemLocation}>{item.location}</Text>
            )}
          </View>
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
          <View style={S.itemTopRow} wrap={false}>
            <Text style={S.itemCompany}>{item.institution}</Text>
            <Text style={S.itemDateRange}>
              {item.start_date} – {item.is_current ? "Present" : item.end_date}
            </Text>
          </View>
          <View style={S.itemSubRow} wrap={false}>
            <Text style={S.itemRole}>{item.degree}</Text>
            {item.location && (
              <Text style={S.itemLocation}>{item.location}</Text>
            )}
          </View>
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
          <View key={i} style={S.bullet} wrap={false}>
            <Text style={S.bulletDot}>•</Text>
            <Text style={S.bulletText}>{skill}</Text>
          </View>
        ))}
      </View>
    );
  }

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
          <Text style={S.groupLabel}>{group.label}: </Text>
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
          <View style={S.projectTopRow} wrap={false}>
            <Text style={S.projectName}>{item.name}</Text>
            {(item.start_date || item.end_date) && (
              <Text style={S.projectDate}>
                {item.start_date}
                {item.end_date ? ` – ${item.end_date}` : ""}
              </Text>
            )}
          </View>
          {item.tech_stack && item.tech_stack.length > 0 && (
            <Text style={S.projectStack}>{item.tech_stack.join(", ")}</Text>
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
      {section.items.map((item, i, arr) => (
        <View
          key={item.id}
          style={{ marginBottom: i < arr.length - 1 ? 6 : 0 }}
          wrap={false}
        >
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

function ResumeTemplate2({ resumeData }: IResumeTemplateProps) {
  const data: ResumeData = JSON.parse(resumeData);
  const { header, sections } = data;

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <Text style={S.name}>{header.name}</Text>

        {/* Contact row with icons + separators */}
        {header.links.length > 0 && (
          <View style={S.contactRow}>
            {header.links.map((link, i) => (
              <React.Fragment key={link.type}>
                {i > 0 && <Text style={S.contactSep}> | </Text>}
                <View style={S.contactItem}>
                  <LinkIcon type={link.type} size={9} />
                  <Text style={S.contactLabel}>{link.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        )}

        {/* <View style={S.headerRule} /> */}

        {/* Sections */}
        {sortedSections.map((section) => renderSection(section))}
      </Page>
    </Document>
  );
}

export default async (data: IResumeTemplateProps) => {
  return await ReactPDF.renderToStream(<ResumeTemplate2 {...data} />);
};
