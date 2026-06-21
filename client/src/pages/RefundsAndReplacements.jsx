import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import Containar from "../layouts/Containar";

const RefundsAndReplacements = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* <BradCumbs title="রিফান্ড ও রিপ্লেসমেন্ট পলিসি" /> */}
      <div className="bg-gray-50 py-6 sm:py-8 md:py-12 font-inter">
        <Containar>
          <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-100 rounded-2xl p-6 sm:p-10 md:p-12">
            <h1 className="text-3xl font-extrabold text-texthead mb-8 tracking-tight border-b border-gray-100 pb-4">
              রিফান্ড ও রিপ্লেসমেন্ট পলিসি
            </h1>
            <p className="text-paracolor text-base leading-relaxed mb-8">
              এক্সট্রা কেয়ার বিডি-তে আমরা আপনার কেনাকাটার অভিজ্ঞতাকে নির্বিঘ্ন করতে সর্বদা সচেষ্ট। অনুগ্রহ করে নিচে আমাদের রিফান্ড ও রিপ্লেসমেন্ট পলিসি দেখে নিন।
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  রিফান্ডের যোগ্যতা
                </h2>
                <p className="text-paracolor text-base leading-relaxed mb-4">
                  নিম্নলিখিত পরিস্থিতিতে রিফান্ড বা মূল্য ফেরত মঞ্জুর করা হতে পারে:
                </p>
                <ul className="space-y-3 pl-2">
                  {[
                    "ভুল পণ্য ডেলিভারি করা হলে",
                    "ক্ষতিগ্রস্ত বা ত্রুটিযুক্ত পণ্য পাওয়া গেলে",
                    "মূল্য পরিশোধ করার পর পণ্যটি স্টকে না থাকলে",
                    "এক্সট্রা কেয়ার বিডি কর্তৃক অর্ডার বাতিলকরণ অনুমোদিত হলে",
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
                  রিফান্ডের অনুরোধ
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  পণ্যটি গ্রহণের <strong className="text-texthead font-semibold">৩ দিনের</strong> মধ্যে গ্রাহককে যেকোনো সমস্যা সম্পর্কে জানাতে হবে। প্রামাণিক প্রমাণ হিসেবে ছবি বা ভিডিওর প্রয়োজন হতে পারে।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  রিফান্ড প্রক্রিয়া
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  অনুমোদন পাওয়ার পর, মূল পেমেন্ট মাধ্যম বা অন্য কোনো পারস্পরিক সম্মত মাধ্যমে <strong className="text-texthead font-semibold">৭–১০ কার্যদিবসের</strong> মধ্যে রিফান্ড সম্পন্ন করা হবে।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  যেসব ক্ষেত্রে রিফান্ড প্রযোজ্য নয়
                </h2>
                <p className="text-paracolor text-base leading-relaxed mb-4">
                  নিম্নলিখিত বিষয়গুলোর জন্য কোনো রিফান্ড দেয়া হবে না:
                </p>
                <ul className="space-y-3 pl-2">
                  {[
                    "ক্রয় করার পর মন পরিবর্তন বা সিদ্ধান্ত বদল করা হলে",
                    "গ্রাহক দ্বারা ব্যবহৃত, ক্ষতিগ্রস্ত বা পরিবর্তিত পণ্য",
                    "গ্রাহকের চাহিদা অনুযায়ী কাস্টমাইজড বা বিশেষ অর্ডারের পণ্য",
                    "ইতিমধ্যে ডেলিভারি করা ডিজিটাল পণ্য বা সেবা",
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
                  এক্সট্রা কেয়ার বিডি পরিস্থিতির ওপর ভিত্তি করে যেকোনো রিফান্ড অনুরোধ গ্রহণ বা প্রত্যাখ্যান করার অধিকার সংরক্ষণ করে।
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
