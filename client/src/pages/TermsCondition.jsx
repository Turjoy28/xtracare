import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import Containar from "../layouts/Containar";

const TermsCondition = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <BradCumbs title="Terms & Conditions" />
      <div className="bg-gray-50 py-12 sm:py-16 md:py-20 font-inter">
        <Containar>
          <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-100 rounded-2xl p-6 sm:p-10 md:p-12">
            <div className="flex justify-between items-baseline border-b border-gray-100 pb-4 mb-8">
              <h1 className="text-3xl font-extrabold text-texthead tracking-tight">
                Terms & Conditions
              </h1>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                Effective: June 2026
              </span>
            </div>

            <p className="text-paracolor text-base leading-relaxed mb-8">
              By accessing or purchasing from RPC World BD, you agree to the following Terms & Conditions.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">1.</span>
                  General
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  RPC World BD reserves the right to modify, suspend, or discontinue any service, product, or policy at any time without prior notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">2.</span>
                  Product Information
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  We make every effort to ensure that product descriptions, pricing, and availability are accurate. However, errors may occasionally occur, and we reserve the right to correct them without prior notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">3.</span>
                  Orders
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  All orders are subject to acceptance and availability. RPC World BD reserves the right to refuse or cancel any order for any reason.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">4.</span>
                  Pricing and Payments
                </h2>
                <div className="pl-6 space-y-3">
                  <p className="text-paracolor text-base leading-relaxed">
                    Our policies regarding prices and transactions include:
                  </p>
                  <ul className="space-y-2">
                    {[
                      "All prices are listed in Bangladeshi Taka (BDT).",
                      "Prices may change without prior notice.",
                      "Orders will be processed after payment confirmation where applicable.",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-paracolor text-base">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/80 mt-2.5 flex-shrink-0"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">5.</span>
                  Shipping and Delivery
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  Delivery times are estimates and may vary. RPC World BD is not liable for delays caused by third-party courier services or circumstances beyond our control.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">6.</span>
                  Returns and Refunds
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  Returns and refunds are subject to our Refund Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">7.</span>
                  Intellectual Property
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  All content, logos, images, trademarks, and materials used by RPC World BD are the property of RPC World BD and may not be copied, reproduced, or used without written permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">8.</span>
                  Limitation of Liability
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  RPC World BD shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">9.</span>
                  Governing Law
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  These Terms & Conditions shall be governed by and interpreted in accordance with the laws of Bangladesh.
                </p>
              </section>

              <section className="pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Contact Information
                </h2>
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

              <p className="text-paracolor text-sm italic mt-8 text-center border-t border-gray-100 pt-6">
                By using our services, you acknowledge that you have read, understood, and agreed to these Terms & Conditions, Privacy Policy, Refund Policy, and Delivery Policy.
              </p>
            </div>
          </div>
        </Containar>
      </div>
    </>
  );
};

export default TermsCondition;
