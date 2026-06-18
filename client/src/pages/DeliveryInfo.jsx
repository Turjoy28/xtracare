import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import Containar from "../layouts/Containar";

const DeliveryInfo = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* <BradCumbs title="ডেলিভারি সংক্রান্ত তথ্য" /> */}
      <div className="bg-gray-50 py-6 sm:py-8 md:py-12 font-inter">
        <Containar>
          <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-100 rounded-2xl p-6 sm:p-10 md:p-12">
            <h1 className="text-3xl font-extrabold text-texthead mb-8 tracking-tight border-b border-gray-100 pb-4">
              ডেলিভারি পলিসি
            </h1>
            <p className="text-paracolor text-base leading-relaxed mb-8">
              আরপিসি ওয়ার্ল্ড বিডি-তে আমরা অত্যন্ত নিরাপদে এবং দক্ষতার সাথে পুরো বাংলাদেশে আপনার অর্ডার পৌঁছে দিতে প্রতিশ্রুতিবদ্ধ। অনুগ্রহ করে নিচে আমাদের ডেলিভারি সংক্রান্ত বিস্তারিত তথ্য পড়ে নিন।
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  ডেলিভারি কভারেজ
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  আরপিসি ওয়ার্ল্ড বিডি সমগ্র বাংলাদেশে ডেলিভারি সেবা প্রদান করে থাকে।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  ডেলিভারি সময়
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">ঢাকার ভিতরে</p>
                    <p className="text-2xl font-bold text-texthead">১–৩ কার্যদিবস</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">ঢাকার বাইরে</p>
                    <p className="text-2xl font-bold text-texthead">২–৭ কার্যদিবস</p>
                  </div>
                </div>
                <p className="text-paracolor text-sm italic">
                  অবস্থান, কুরিয়ার কার্যক্রম, সরকারি ছুটির দিন বা অন্যান্য অপ্রত্যাশিত পরিস্থিতির ওপর ভিত্তি করে ডেলিভারি সময় পরিবর্তিত হতে পারে।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  ডেলিভারি চার্জ
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  অবস্থান, প্যাকেজের আকার এবং কুরিয়ার সার্ভিসের হারের ওপর ভিত্তি করে ডেলিভারি চার্জ নির্ধারণ করা হয়।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  অর্ডার নিশ্চিতকরণ
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  অর্ডারটি শিপমেন্টের জন্য পাঠানোর আগে বিবরণ যাচাই করার জন্য আরপিসি ওয়ার্ল্ড বিডি গ্রাহকদের সাথে যোগাযোগ করতে পারে।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  ডেলিভারিতে বিলম্ব
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  আমরা যথাসময়ে অর্ডার ডেলিভারি করার জন্য সর্বোচ্চ চেষ্টা করি। তবে কুরিয়ার সার্ভিস, প্রাকৃতিক দুর্যোগ, সরকারি নিষেধাজ্ঞা বা আমাদের নিয়ন্ত্রণের বাইরের যেকোনো পরিস্থিতির কারণে সৃষ্ট কোনো বিলম্বের জন্য আমরা দায়ী নই।
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
