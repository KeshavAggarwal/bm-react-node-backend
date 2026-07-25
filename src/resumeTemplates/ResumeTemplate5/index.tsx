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
  WorkExperienceItem,
  EducationItem,
} from "../../types/resumeTypes";

Font.register({
  family: "SourceSerif4",
  fonts: [
    {
      src: path.resolve(
        __dirname,
        "../../assets/fonts/SourceSerif4-Regular.ttf",
      ),
      fontWeight: 400,
    },
    {
      src: path.resolve(
        __dirname,
        "../../assets/fonts/SourceSerif4-Medium.ttf",
      ),
      fontWeight: 500,
    },
    {
      src: path.resolve(
        __dirname,
        "../../assets/fonts/SourceSerif4-SemiBold.ttf",
      ),
      fontWeight: 600,
    },
    {
      src: path.resolve(__dirname, "../../assets/fonts/SourceSerif4-Bold.ttf"),
      fontWeight: 700,
    },
    {
      src: path.resolve(
        __dirname,
        "../../assets/fonts/SourceSerif4-Italic.ttf",
      ),
      fontStyle: "italic",
      fontWeight: 400,
    },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

// ── Filled icons (Material Design style) ─────────────────────────────────────

function FilledIcon({ type, size = 10 }: { type: string; size?: number }) {
  const c = "#222";
  switch (type) {
    case "address":
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            fill={c}
            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
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
    case "email":
      return (
        <Svg viewBox="0 0 24 24" width={size} height={size}>
          <Path
            fill={c}
            d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
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

// ── Styles ────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  page: {
    fontFamily: "SourceSerif4",
    paddingTop: 42,
    paddingBottom: 42,
    paddingLeft: 46,
    paddingRight: 46,
    backgroundColor: "#ffffff",
  },
  // ── Header ──────────────────────────────────────────────
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 11,
    color: "#555",
    marginBottom: 10,
  },
  // Contact grid: two rows × two columns
  contactGrid: { flexDirection: "column", marginBottom: 14 },
  contactGridRow: { flexDirection: "row", marginBottom: 4 },
  contactCell: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
  },
  contactText: {
    fontSize: 10,
    color: "#111",
    marginLeft: 5,
  },
  // ── Section header band ───────────────────────────────────
  sectionBand: {
    backgroundColor: "#ebebeb",
    paddingVertical: 5,
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111",
  },
  sectionGap: { marginBottom: 10 },
  // ── Summary ──────────────────────────────────────────────
  summaryText: {
    fontSize: 11,
    color: "#333",
    lineHeight: 1.55,
    textAlign: "justify",
  },
  // ── Work / Education items ───────────────────────────────
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  itemLeft: { flex: 1, paddingRight: 8 },
  itemRight: { alignItems: "flex-end" },
  itemRole: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111",
  },
  itemCompanyInline: {
    fontSize: 11,
    color: "#111",
  },
  itemDegree: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111",
  },
  itemInstitution: {
    fontSize: 11,
    color: "#111",
  },
  itemDate: {
    fontSize: 11,
    color: "#111",
  },
  itemLocation: {
    fontSize: 11,
    color: "#111",
  },
  itemBlock: { marginBottom: 9 },
  // ── Bullets ──────────────────────────────────────────────
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 2,
  },
  bulletDot: {
    fontSize: 11,
    color: "#111",
    marginRight: 5,
    lineHeight: 1.5,
  },
  bulletText: {
    fontSize: 11,
    color: "#111",
    flex: 1,
    lineHeight: 1.45,
  },
  // ── Two-column skills / languages / certs ────────────────
  twoColWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  twoColItem: {
    flexDirection: "row",
    width: "50%",
    marginBottom: 4,
  },
  twoColDot: {
    fontSize: 11,
    color: "#111",
    marginRight: 5,
    lineHeight: 1.5,
  },
  twoColText: {
    fontSize: 11,
    color: "#111",
    flex: 1,
  },
  // ── Skills grouped ───────────────────────────────────────
  groupRow: {
    flexDirection: "row",
    marginBottom: 3,
    flexWrap: "wrap",
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#111",
  },
  groupValue: {
    fontSize: 11,
    color: "#111",
    flex: 1,
    lineHeight: 1.4,
  },
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

function TwoColList({ items }: { items: string[] }) {
  return (
    <View style={S.twoColWrap}>
      {items.map((item, i) => (
        <View key={i} style={S.twoColItem} wrap={false}>
          <Text style={S.twoColDot}>•</Text>
          <Text style={S.twoColText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function ContactCell({ link }: { link: ResumeLink }) {
  return (
    <View style={S.contactCell}>
      <FilledIcon type={link.type} size={10} />
      <Text style={S.contactText}>{link.label}</Text>
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
        <View key={item.id} style={S.itemBlock}>
          <View style={S.itemRow} wrap={false}>
            <View style={S.itemLeft}>
              <Text>
                <Text style={S.itemRole}>{item.role}</Text>
                {item.company ? (
                  <Text style={S.itemCompanyInline}>, {item.company}</Text>
                ) : null}
              </Text>
            </View>
            <View style={S.itemRight}>
              <Text style={S.itemDate}>
                {item.start_date} –{" "}
                {item.is_current ? "Present" : item.end_date}
              </Text>
              {item.location && (
                <Text style={S.itemLocation}>{item.location}</Text>
              )}
            </View>
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
      {section.items.map((item: EducationItem) => (
        <View key={item.id} style={S.itemBlock}>
          <View style={S.itemRow} wrap={false}>
            <View style={S.itemLeft}>
              <Text>
                <Text style={S.itemDegree}>{item.degree}</Text>
                {item.institution ? (
                  <Text style={S.itemInstitution}>, {item.institution}</Text>
                ) : null}
              </Text>
            </View>
            <View style={S.itemRight}>
              <Text style={S.itemDate}>
                {item.start_date} –{" "}
                {item.is_current ? "Present" : item.end_date}
              </Text>
              {item.location && (
                <Text style={S.itemLocation}>{item.location}</Text>
              )}
            </View>
          </View>
          <BulletList bullets={item.bullets} />
        </View>
      ))}
    </View>
  );
}

function renderSkills(section: SkillsSection) {
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      <TwoColList items={section.items} />
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
        <View key={item.id} style={S.itemBlock}>
          <View style={S.itemRow} wrap={false}>
            <Text style={[S.itemRole, { flex: 1 }]}>{item.name}</Text>
            {(item.start_date || item.end_date) && (
              <Text style={S.itemDate}>
                {item.start_date}
                {item.end_date ? ` – ${item.end_date}` : ""}
              </Text>
            )}
          </View>
          {item.tech_stack && item.tech_stack.length > 0 && (
            <Text style={S.itemCompanyInline}>
              {item.tech_stack.join(" · ")}
            </Text>
          )}
          <BulletList bullets={item.bullets} />
        </View>
      ))}
    </View>
  );
}

function renderCertificates(section: CertificatesSection) {
  // Render as a two-column bullet list (just names)
  const names = section.items.map((item) => item.name);
  return (
    <View key={section.id} style={S.sectionGap}>
      <SectionHeader title={section.title} />
      <TwoColList items={names} />
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

function ResumeTemplate5({ resumeData }: IResumeTemplateProps) {
  const data: ResumeData = JSON.parse(resumeData);
  const { header, sections } = data;

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Split links into two columns: first half left, second half right
  const mid = Math.ceil(header.links.length / 2);
  const leftLinks = header.links.slice(0, mid);
  const rightLinks = header.links.slice(mid);
  const rowCount = Math.max(leftLinks.length, rightLinks.length);

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <Text style={S.name}>{header.name}</Text>
        {header.title && <Text style={S.headerTitle}>{header.title}</Text>}

        {/* Contact 2-column grid */}
        {header.links.length > 0 && (
          <View style={S.contactGrid}>
            {Array.from({ length: rowCount }).map((_, i) => (
              <View key={i} style={S.contactGridRow}>
                {leftLinks[i] && <ContactCell link={leftLinks[i]} />}
                {rightLinks[i] && <ContactCell link={rightLinks[i]} />}
              </View>
            ))}
          </View>
        )}

        {/* Sections */}
        {sortedSections.map((section) => renderSection(section))}
      </Page>
    </Document>
  );
}

export default async (data: IResumeTemplateProps) => {
  return await ReactPDF.renderToStream(<ResumeTemplate5 {...data} />);
};
