import React from "react";
import Containar from "../../layouts/Containar";

const ParagraphtoList = ({ paragraph }) => {
  return (
    <section className="p-5 border">
      <div
        className="default_behave"
        dangerouslySetInnerHTML={{ __html: paragraph }}
      />
    </section>
  );
};

export default ParagraphtoList;
