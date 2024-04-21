import express from 'express';
import template12 from '../templates/Template12';
import { encodeFormData } from '../utils';
import { ITemplateProps } from '../types/templateTypes';

const Router = express.Router();

Router.post('/', async (req, res) => {
  try {
    const { template_id, fd, image_path } = req.body;

    const aa = JSON.stringify(fd);
    const formdata: ITemplateProps = {
      formData: aa,
      isPreview: false,
      imagePath: null,
    };
    const result = await template12(formdata);
    // Setting up the response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=export.pdf`);

    // Streaming our resulting pdf back to the user
    result.pipe(res);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Internal Server Error');
  }
});

export { Router };
