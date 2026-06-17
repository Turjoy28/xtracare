import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import Containar from "../layouts/Containar";

const DeliveryInfo = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <BradCumbs title="Delivery Information" />
      <div className="bg-gray-50 py-12 sm:py-16 md:py-20 font-inter">
        <Containar>
          <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-100 rounded-2xl p-6 sm:p-10 md:p-12">
            <h1 className="text-3xl font-extrabold text-texthead mb-8 tracking-tight border-b border-gray-100 pb-4">
              Delivery Policy
            </h1>
            <p className="text-paracolor text-base leading-relaxed mb-8">
              At RPC World BD, we are committed to delivering your orders safely and efficiently across Bangladesh. Please read our delivery details below.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Delivery Coverage
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  RPC World BD provides delivery services throughout Bangladesh.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Delivery Time
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Inside Dhaka</p>
                    <p className="text-2xl font-bold text-texthead">1–3 Business Days</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Outside Dhaka</p>
                    <p className="text-2xl font-bold text-texthead">2–7 Business Days</p>
                  </div>
                </div>
                <p className="text-paracolor text-sm italic">
                  Delivery times may vary depending on location, courier operations, public holidays, or unforeseen circumstances.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Delivery Charges
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  Delivery charges are calculated based on location, package size, and courier rates.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Order Confirmation
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  RPC World BD may contact customers to verify order details before processing shipments.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  Delivery Delays
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  While we strive to deliver orders on time, we are not responsible for delays caused by courier services, natural disasters, government restrictions, or other events beyond our control.
                </p>
              </section>
            </div>
          </div>
        </Containar>
      </div>
    </>
  );
};

export default DeliveryInfo;
