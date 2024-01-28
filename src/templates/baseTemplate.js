import React from 'react';
import { Document } from '@react-pdf/renderer';
import MainPage from './mainPage.js';

const BaseTemplate = (props) => {
  return (
    <Document>
      <MainPage {...props} />
    </Document>
  );
};

export default BaseTemplate;
// module.exports = { BaseTemplate };
// export { BaseTemplate };
