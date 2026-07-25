export interface ResumeLink {
  type: 'email' | 'phone' | 'linkedin' | 'github' | 'behance' | 'portfolio' | 'website' | 'address';
  label: string;
  url?: string;
}

export interface ResumeHeader {
  name: string;
  title?: string;
  photo_url?: string;
  links: ResumeLink[];
}

export interface WorkExperienceItem {
  id: string;
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  bullets: string[];
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  link?: string;
  tech_stack?: string[];
  start_date?: string;
  end_date?: string;
  bullets: string[];
}

export interface CertificateItem {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
  link?: string;
}

export interface BaseSectionProps {
  id: string;
  title: string;
  order: number;
  column?: 'left' | 'right';
}

export interface SummarySection extends BaseSectionProps {
  type: 'summary';
  text: string;
}

export interface WorkExperienceSection extends BaseSectionProps {
  type: 'work_experience';
  items: WorkExperienceItem[];
}

export interface EducationSection extends BaseSectionProps {
  type: 'education';
  items: EducationItem[];
}

export interface SkillsSection extends BaseSectionProps {
  type: 'skills';
  layout: 'columns' | 'tags' | 'list';
  items: string[];
}

export interface SkillsGroupedSection extends BaseSectionProps {
  type: 'skills_grouped';
  groups: SkillGroup[];
}

export interface ProjectsSection extends BaseSectionProps {
  type: 'projects';
  items: ProjectItem[];
}

export interface CertificatesSection extends BaseSectionProps {
  type: 'certificates';
  items: CertificateItem[];
}

export interface LanguageItem {
  name: string;
  level: number; // 1–5
}

export interface LanguagesSection extends BaseSectionProps {
  type: 'languages';
  items: LanguageItem[];
}

export type ResumeSection =
  | SummarySection
  | WorkExperienceSection
  | EducationSection
  | SkillsSection
  | SkillsGroupedSection
  | ProjectsSection
  | CertificatesSection
  | LanguagesSection;

export interface ResumeData {
  header: ResumeHeader;
  sections: ResumeSection[];
}

export interface IResumeTemplateProps {
  resumeData: string; // JSON string of ResumeData
}
