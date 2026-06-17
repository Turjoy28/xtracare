import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import Containar from "../layouts/Containar";

const RefundsAndReplacements = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <BradCumbs title="Refund & Replacement Policy" />
      <div className="bg-gray-50 py-12 sm:py-16 md:py-20 font-inter">
        <Containar>
          <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-100 rounded-2xl p-6 sm:p-10 md:p-12">
            <h1 className="text-3xl font-extrabold text-texthead mb-8 tracking-tight border-b border-gray-100 pb-4">
              Refund & Replacement Policy
            </h1>
            <p className="text-paracolor text-base leading-relaxed mb-8">
              At RPC World BD, we strive to ensure a seamless shopping experience. Please review our policy on refunds and replacements below.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Refund Eligibility
                </h2>
                <p className="text-paracolor text-base leading-relaxed mb-4">
                  Refunds may be approved under the following circumstances:
                </p>
                <ul className="space-y-3 pl-2">
                  {[
                    "Wrong product delivered",
                    "Damaged or defective product received",
                    "Product unavailable after payment has been made",
                    "Order cancellation approved by RPC World BD",
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
                  Refund Request
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  Customers must report any issue within <strong className="text-texthead font-semibold">3 days</strong> of receiving the product. Supporting evidence such as photos or videos may be required.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Refund Process
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  Once approved, refunds will be processed within <strong className="text-texthead font-semibold">7–10 business days</strong> through the original payment method or another mutually agreed method.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Non-Refundable Situations
                </h2>
                <p className="text-paracolor text-base leading-relaxed mb-4">
                  Refunds will not be provided for:
                </p>
                <ul className="space-y-3 pl-2">
                  {[
                    "Change of mind after purchase",
                    "Products that have been used, damaged, or altered by the customer",
                    "Customized or special-order products",
                    "Digital products or services that have already been delivered",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-paracolor text-base">
                      <span className="w-2 h-2 rounded-full bg-red-400 mt-2.5 flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="pt-6 border-t border-gray-100">
                <p className="text-paracolor text-sm italic">
                  RPC World BD reserves the right to approve or reject refund requests based on the circumstances.
                </p>
              </section>
            </div>
          </div>
        </Containar>
      </div>
    </>
  );
};

export default RefundsAndReplacements;
