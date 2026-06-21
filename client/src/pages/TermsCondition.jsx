import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import Containar from "../layouts/Containar";

const TermsCondition = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* <BradCumbs title="শর্তাবলী" /> */}
      <div className="bg-gray-50 py-6 sm:py-8 md:py-12 font-inter">
        <Containar>
          <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-100 rounded-2xl p-6 sm:p-10 md:p-12">
            <div className="flex justify-between items-baseline border-b border-gray-100 pb-4 mb-8">
              <h1 className="text-3xl font-extrabold text-texthead tracking-tight">
                শর্তাবলী
              </h1>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                কার্যকরী: জুন ২০২৬
              </span>
            </div>

            <p className="text-paracolor text-base leading-relaxed mb-8">
              এক্সট্রা কেয়ার বিডি-তে প্রবেশ করার মাধ্যমে বা এখান থেকে কেনাকাটা করার মাধ্যমে আপনি নিম্নলিখিত শর্তাবলীতে সম্মত হচ্ছেন।
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">১.</span>
                  সাধারণ নিয়মাবলী
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  এক্সট্রা কেয়ার বিডি পূর্ব নোটিশ ছাড়াই যেকোনো সময় যেকোনো সেবা, পণ্য বা পলিসি পরিবর্তন, স্থগিত বা বন্ধ করার অধিকার সংরক্ষণ করে।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">২.</span>
                  পণ্যের তথ্য
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  আমরা পণ্যের বিবরণ, মূল্য এবং প্রাপ্যতা সঠিক তা নিশ্চিত করার জন্য সব ধরনের প্রচেষ্টা চালাই। তবুও, মাঝে মাঝে কিছু ভুলত্রুটি হতে পারে এবং পূর্ব নোটিশ ছাড়াই তা সংশোধন করার অধিকার আমরা সংরক্ষণ করি।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">৩.</span>
                  অর্ডার
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  সমস্ত অর্ডার গ্রহণ এবং পণ্যের স্টক থাকার ওপর নির্ভরশীল। এক্সট্রা কেয়ার বিডি যেকোনো কারণে যেকোনো অর্ডার বাতিল বা প্রত্যাখ্যান করার অধিকার সংরক্ষণ করে।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">৪.</span>
                  মূল্য এবং পেমেন্ট
                </h2>
                <div className="pl-6 space-y-3">
                  <p className="text-paracolor text-base leading-relaxed">
                    মূল্য ও লেনদেন সংক্রান্ত আমাদের নীতিসমূহ নিচে দেওয়া হলো:
                  </p>
                  <ul className="space-y-2">
                    {[
                      "সমস্ত মূল্য বাংলাদেশী টাকায় (BDT) উল্লেখ করা হয়েছে।",
                      "পূর্ব ঘোষণা ছাড়াই যেকোনো সময় মূল্য পরিবর্তিত হতে পারে।",
                      "প্রযোজ্য ক্ষেত্রে পেমেন্ট নিশ্চিত হওয়ার পর অর্ডার প্রসেস করা হবে।",
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
                  <span className="text-primary font-extrabold">৫.</span>
                  শিপিং ও ডেলিভারি
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  ডেলিভারির সময়টি আনুমানিক এবং এটি পরিবর্তিত হতে পারে। তৃতীয় পক্ষের কুরিয়ার সার্ভিস বা আমাদের নিয়ন্ত্রণের বাইরের পরিস্থিতির কারণে সৃষ্ট কোনো বিলম্বের জন্য এক্সট্রা কেয়ার বিডি দায়ী থাকবে না।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">৬.</span>
                  রিটার্ন ও রিফান্ড
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  রিটার্ন এবং রিফান্ড আমাদের রিফান্ড পলিসি অনুযায়ী পরিচালিত হবে।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">৭.</span>
                  বুদ্ধিবৃত্তিক সম্পত্তি
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  এক্সট্রা কেয়ার বিডি দ্বারা ব্যবহৃত সমস্ত কনটেন্ট, লোগো, ছবি, ট্রেডমার্ক এবং অন্যান্য উপাদান এক্সট্রা কেয়ার বিডি-র নিজস্ব সম্পত্তি এবং লিখিত অনুমতি ছাড়া এগুলো কপি, পুনরায় ব্যবহার বা ব্যবহার করা যাবে না।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">৮.</span>
                  দায়বদ্ধতার সীমাবদ্ধতা
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  আমাদের পণ্য বা সেবা ব্যবহারের ফলে সৃষ্ট যেকোনো পরোক্ষ, আনুষঙ্গিক, বিশেষ বা ফলস্বরূপ ক্ষতির জন্য এক্সট্রা কেয়ার বিডি দায়ী থাকবে না।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-3 flex items-center gap-2">
                  <span className="text-primary font-extrabold">৯.</span>
                  প্রযোজ্য আইন
                </h2>
                <p className="text-paracolor text-base leading-relaxed pl-6">
                  এই শর্তাবলী বাংলাদেশের আইন অনুযায়ী পরিচালিত এবং ব্যাখ্যা করা হবে।
                </p>
              </section>

              <section className="pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  যোগাযোগের ঠিকানা
                </h2>
                <div className="bg-gray-50 rounded-xl p-6 space-y-3 border border-gray-100">
                  <p className="text-texthead text-base">
                    <strong>Extracare BD</strong>
                  </p>
                  <p className="text-paracolor text-base flex flex-wrap gap-x-2">
                    <strong>ফোন:</strong>
                    <a href="tel:+8801577498985" className="text-primary hover:underline font-medium">
                      +8801577498985
                    </a>
                  </p>
                  <p className="text-paracolor text-base flex flex-wrap gap-x-2">
                    <strong>ইমেইল:</strong>
                    <a href="mailto:sahanazmoni.sm@gmail.com" className="text-primary hover:underline font-medium">
                      sahanazmoni.sm@gmail.com
                    </a>
                  </p>
                  <p className="text-paracolor text-base">
                    <strong>ঠিকানা:</strong> নানীখির, নানীখির, মুকসুদপুর, গোপালগঞ্জ
                  </p>
                </div>
              </section>

              <p className="text-paracolor text-sm italic mt-8 text-center border-t border-gray-100 pt-6">
                আমাদের সেবাগুলো ব্যবহার করার মাধ্যমে আপনি স্বীকার করছেন যে আপনি এই শর্তাবলী, প্রাইভেসি পলিসি, রিফান্ড পলিসি এবং ডেলিভারি পলিসি পড়েছেন, বুঝেছেন এবং এতে সম্মত হয়েছেন।
              </p>
            </div>
          </div>
        </Containar>
      </div>
    </>
  );
};

export default TermsCondition;
