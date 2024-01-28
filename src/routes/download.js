import React from 'react';
import express from 'express';
import { BaseTemplate } from '../templates/baseTemplate.js';
import generatePdf from '../generatePdf.js';

const Router = express.Router();

// const Template12 = () => {
//   return (
//     <Document>
//       <MainPage {...props} />
//     </Document>
//   );

//   return (
//     <BaseTemplate
//       styles={STYLES}
//       backgroundPath="/images/template-bg-12.png"
//       isPreview={isPreview}
//     />
//   );
// };

// const Template12 = () => (
//   <Document>
//     <Page>
//       <Text>React-pdf</Text>
//     </Page>
//   </Document>
// );

Router.post('/', async (req, res) => {
  const formData = req.body;
  try {
    const outputPath = await generatePdf();
    res.download(outputPath, 'output.pdf', (err) => {
      if (err) {
        console.error('Error sending PDF:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Internal Server Error');
  }
});

export { Router };
