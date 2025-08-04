import React from "react";
import { Document } from "@react-pdf/renderer";
import MainPage from "./MainPage";
import { IBaseTemplateProps } from "../types";

const CenterColorBaseTemplate = (props: IBaseTemplateProps) => {
  return (
    <Document>
      <MainPage {...props} />
    </Document>
  );
};

export default CenterColorBaseTemplate;
