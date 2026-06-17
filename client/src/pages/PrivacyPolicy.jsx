import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import Containar from "../layouts/Containar";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <BradCumbs title="Privacy Policy" />
      <div className="bg-gray-50 py-12 sm:py-16 md:py-20 font-inter">
        <Containar>
          <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-100 rounded-2xl p-6 sm:p-10 md:p-12">
            <h1 className="text-3xl font-extrabold text-texthead mb-8 tracking-tight border-b border-gray-100 pb-4">
              Privacy Policy
            </h1>
            <p className="text-paracolor text-base leading-relaxed mb-8">
              At RPC World BD, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you interact with our website, social media pages, or services.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Information We Collect
                </h2>
                <p className="text-paracolor text-base leading-relaxed mb-4">
                  We may collect the following information:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                  {[
                    "Full Name",
                    "Phone Number",
                    "Email Address",
                    "Shipping/Billing Address",
                    "Payment Information (where applicable)",
                    "Order History",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-paracolor text-base">
                      <span className="w-2 h-2 rounded-full bg-primary/80"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  How We Use Your Information
                </h2>
                <p className="text-paracolor text-base leading-relaxed mb-4">
                  We use your information to:
                </p>
                <ul className="space-y-3 pl-2">
                  {[
                    "Process and deliver orders",
                    "Provide customer support",
                    "Improve our products and services",
                    "Send updates regarding orders, promotions, and offers",
                    "Prevent fraud and maintain security",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-paracolor text-base">
                      <span className="w-2 h-2 rounded-full bg-primary/80 mt-2.5 flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Information Sharing
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  We do not sell, rent, or trade your personal information to third parties. Information may be shared with trusted delivery and payment service providers only when necessary to fulfill your order.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Data Security
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  We implement reasonable security measures to protect your personal information from unauthorized access, disclosure, or misuse.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Changes to This Policy
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  RPC World BD reserves the right to update this Privacy Policy at any time. Changes will be posted on this page.
                </p>
              </section>

              <section className="pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Contact Us
                </h2>
                <p className="text-paracolor text-base leading-relaxed mb-4">
                  If you have any questions regarding this Privacy Policy, please contact us.
                </p>
                <div className="bg-gray-50 rounded-xl p-6 space-y-3 border border-gray-100">
                  <p className="text-texthead text-base">
                    <strong>RPC World BD</strong>
                  </p>
                  <p className="text-paracolor text-base flex flex-wrap gap-x-2">
                    <strong>Phone:</strong>
                    <a href="tel:+8801718674140" className="text-primary hover:underline font-medium">
                      +8801718674140
                    </a>
                  </p>
                  <p className="text-paracolor text-base flex flex-wrap gap-x-2">
                    <strong>Email:</strong>
                    <a href="mailto:rpcworldbd@gmail.com" className="text-primary hover:underline font-medium">
                      rpcworldbd@gmail.com
                    </a>
                  </p>
                  <p className="text-paracolor text-base">
                    <strong>Address:</strong> Dhaka Cantonment, Dhaka, Bangladesh
                  </p>
                </div>
              </section>
            </div>
          </div>
        </Containar>
      </div>
    </>
  );
};

export default PrivacyPolicy;
