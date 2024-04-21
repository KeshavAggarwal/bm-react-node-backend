import React from 'react';
import ReactPDF, { Font, StyleSheet } from '@react-pdf/renderer';
import { ITemplateProps } from '../../types/templateTypes';
import BaseTemplate from '../BaseTemplate';

Font.register({
  family: 'Lora',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/lora/v32/0QI6MX1D_JOuGQbT0gvTJPa787wsuyJGmKxemMeZ.ttf',
    },
    {
      src: 'https://fonts.gstatic.com/s/lora/v32/0QI6MX1D_JOuGQbT0gvTJPa787z5vCJGmKxemMeZ.ttf',
      fontWeight: 'bold',
    },
  ],
});

const STYLES = StyleSheet.create({
  viewer: {
    width: '100vw',
    height: '100vh',
    border: 'none',
  },
  page: {
    display: 'flex',
    flexDirection: 'column',
    padding: '134 40 126 44',
  },
  borderImage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  sectionRow: {
    position: 'relative',
  },
  sectionText: {
    fontFamily: 'Lora',
    fontSize: 14,
    color: '#994B03',
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  sectionGap: {
    height: 26,
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    fontFamily: 'Lora',
    marginBottom: 7,
  },
  keyText: {
    fontSize: 12,
    width: 140,
    color: '#100D0A',
    fontWeight: 500,
  },
  valueText: {
    fontSize: 12,
    fontWeight: 500,
    maxWidth: 300,
    color: '#36454F',
  },
  limitedValueText: {
    maxWidth: 150,
  },
  separator: {
    fontSize: 12,
    marginRight: 24,
    color: '#100D0A',
  },
  profile: {
    position: 'absolute',
    right: 10,
    top: 30,
    width: 140,
    height: 200,
    objectFit: 'cover',
    border: '2 solid #994B03',
    borderRadius: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 2,
  },
});

const Template12 = (props: ITemplateProps) => {
  const backgroundPath = props.isPreview
    ? './images/template/wtm/template-bg-12-wtm.png'
    : './images/template/template-bg-12.png';

  return (
    <BaseTemplate styles={STYLES} backgroundPath={backgroundPath} {...props} />
  );
};

export default async (data: ITemplateProps) => {
  return await ReactPDF.renderToStream(<Template12 {...data} />);
};
