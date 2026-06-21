import React, { useEffect } from "react";
import BradCumbs from "../components/bradcumbs/BradCumbs";
import Containar from "../layouts/Containar";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* <BradCumbs title="প্রাইভেসি পলিসি" /> */}
      <div className="bg-gray-50 py-6 sm:py-8 md:py-12 font-inter">
        <Containar>
          <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-100 rounded-2xl p-6 sm:p-10 md:p-12">
            <h1 className="text-3xl font-extrabold text-texthead mb-8 tracking-tight border-b border-gray-100 pb-4">
              প্রাইভেসি পলিসি
            </h1>
            <p className="text-paracolor text-base leading-relaxed mb-8">
              এক্সট্রা কেয়ার বিডি-তে আমরা আপনার প্রাইভেসির মূল্যায়ন করি এবং আপনার ব্যক্তিগত তথ্য সুরক্ষায় প্রতিশ্রুতিবদ্ধ। আপনি যখন আমাদের ওয়েবসাইট, সোশ্যাল মিডিয়া পেজ বা সেবাসমূহের সাথে যুক্ত হন, তখন আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি তা এই প্রাইভেসি পলিসিতে ব্যাখ্যা করা হয়েছে।
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  যেসব তথ্য আমরা সংগ্রহ করি
                </h2>
                <p className="text-paracolor text-base leading-relaxed mb-4">
                  আমরা নিম্নলিখিত তথ্যগুলো সংগ্রহ করতে পারি:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
                  {[
                    "পূর্ণ নাম",
                    "ফোন নম্বর",
                    "ইমেইল ঠিকানা",
                    "শিপিং/বিলিং ঠিকানা",
                    "পেমেন্ট সংক্রান্ত তথ্য (প্রযোজ্য ক্ষেত্রে)",
                    "অর্ডারের ইতিহাস",
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
                  আমরা যেভাবে আপনার তথ্য ব্যবহার করি
                </h2>
                <p className="text-paracolor text-base leading-relaxed mb-4">
                  আমরা আপনার তথ্যগুলো নিম্নলিখিত কাজে ব্যবহার করি:
                </p>
                <ul className="space-y-3 pl-2">
                  {[
                    "অর্ডার প্রসেস এবং ডেলিভারি করতে",
                    "গ্রাহক সেবা বা সাপোর্ট প্রদান করতে",
                    "আমাদের পণ্য এবং সেবার মান উন্নত করতে",
                    "অর্ডার, প্রমোশন এবং অফার সংক্রান্ত আপডেট পাঠাতে",
                    "প্রতারণা প্রতিরোধ এবং নিরাপত্তা বজায় রাখতে",
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
                  তথ্য শেয়ারিং
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  আমরা তৃতীয় পক্ষের কাছে আপনার ব্যক্তিগত তথ্য বিক্রি, ভাড়া বা বিনিময় করি না। আপনার অর্ডার সম্পন্ন করার জন্য শুধুমাত্র প্রয়োজনীয় ক্ষেত্রে বিশ্বস্ত ডেলিভারি এবং পেমেন্ট সেবাদাতাদের সাথে তথ্য শেয়ার করা হতে পারে।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  ডাটা নিরাপত্তা
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  অননুমোদিত অ্যাক্সেস, প্রকাশ বা অপব্যবহার থেকে আপনার ব্যক্তিগত তথ্য রক্ষা করার জন্য আমরা উপযুক্ত নিরাপত্তা ব্যবস্থা গ্রহণ করি।
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  নীতিমালায় পরিবর্তন
                </h2>
                <p className="text-paracolor text-base leading-relaxed">
                  এক্সট্রা কেয়ার বিডি যেকোনো সময় এই প্রাইভেসি পলিসি আপডেট করার অধিকার সংরক্ষণ করে। যেকোনো পরিবর্তন এই পৃষ্ঠায় প্রকাশ করা হবে।
                </p>
              </section>

              <section className="pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-texthead mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full inline-block"></span>
                  যোগাযোগ করুন
                </h2>
                <p className="text-paracolor text-base leading-relaxed mb-4">
                  এই প্রাইভেসি পলিসি সংক্রান্ত আপনার কোনো প্রশ্ন থাকলে অনুগ্রহ করে আমাদের সাথে যোগাযোগ করুন।
                </p>
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
                    <strong>ঠিকানা:</strong> আশকোনা, হাজী স্কুল রোড, দক্ষিণখান, ঢাকা–১২৩০
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
