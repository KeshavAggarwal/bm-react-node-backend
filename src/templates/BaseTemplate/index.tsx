import React from 'react';
import { Document } from '@react-pdf/renderer';
import MainPage from './MainPage';
// import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
// import 'react-pdf/dist/esm/Page/TextLayer.css';
import { IBaseTemplateProps } from './types';

const BaseTemplate = (props: IBaseTemplateProps) => {
  return (
    <Document>
      <MainPage {...props} />
    </Document>
  );
};

export default BaseTemplate;
