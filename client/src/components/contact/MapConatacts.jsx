import React from "react";

const MapConatacts = () => {
  return (
    <div className="">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.591623768988!2d90.34974072602395!3d23.7975523369632!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c1f326e9312b%3A0xc3af657f82fd03aa!2z4KaV4KeLLeCmheCmquCmvuCmsOCnh-Cmn-Cmv-CmrSDgpq7gpr7gprDgp43gppXgp4fgpp8g4Ka44Ka-4Kan4Ka-4Kaw4KajIOCmrOCnjeCmr-CmrOCmuOCmvuCmr-CmvOCngCDgprjgpq7gpqzgpr7gpq_gprwg4Ka44Kau4Ka_4Kak4Ka_IOCmsuCmv-Cmgw!5e0!3m2!1sen!2sbd!4v1733813494960!5m2!1sen!2sbd"
        className="w-full h-[180px] sm:h-[300px] lg:h-[500px]"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
};

export default MapConatacts;
