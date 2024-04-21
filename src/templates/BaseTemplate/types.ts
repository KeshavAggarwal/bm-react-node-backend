export interface IBaseTemplateProps {
  styles: Record<string, any>;
  backgroundPath: string;
  isPreview: boolean;
  imageVariant?: 'default' | 'front-round' | 'side-round';
  isNameHighlight?: boolean;
  formData: string | null;
  imagePath: string | null;
}
