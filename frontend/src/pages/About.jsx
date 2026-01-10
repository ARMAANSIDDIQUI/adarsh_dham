import React from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaHandsHelping, FaLaptopCode } from 'react-icons/fa';
import { GiLotus } from 'react-icons/gi';

const containerAnimation = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
};

const RULES_HINDI = [
  { title: "1. दैनिक दिनचर्या", content: "प्रातःकाल उठकर शौचादि से निवृत्त होने के उपरान्त भजनाभ्यास, आरती-पूजा नित्य नियमपूर्वक करना, तत्पश्चात् अपने सम्बन्धित सेवा कार्य में लगे रहना।" },
  { title: "2. आध्यात्मिक सहभागिता", content: "दोनों समय की आरती-पूजा में उपस्थित होना एवं प्रतिदिन 2 घंटे का भजनाभ्यास अनिवार्य एवं आवश्यक है।" },
  { title: "3. जीवनशैली", content: "अपनी इच्छाओं को नियन्त्रित रखना, सादा व शाकाहारी भोजन करना और सादा वस्त्र पहनना।" },
  { title: "4. संयम", content: "ब्रह्मचर्य पालन सबके लिए अनिवार्य है।" },
  { title: "5. आंतरिक व्यवहार", content: "अपने चित्त में किसी के प्रति वैर-विरोध अथवा द्वेष को स्थान न देना, सद्भावना एवं नम्रतापूर्वक सबके साथ स्नेहपूर्ण व्यवहार करना।" },
  { title: "6. समय का सदुपयोग", content: "वाद-विवाद तथा व्यर्थ बातों में समय नष्ट करने से परहेज करना, अवकाश के क्षणों में सन्तों की वाणियों का स्वाध्याय करना तथा सत्संग में व्यतीत करना।" },
  { title: "7. चरित्र की पवित्रता", content: "अपने आचरण को पवित्र एवं शुद्ध रखना। असत्य-भाषण तथा अन्यान्य बुराइयों से दूर रहना।" },
  { title: "8. सामाजिक व्यवहार", content: "प्रत्येक के साथ प्रेम और सभ्यता से व्यवहार करना।" },
  { title: "9. कर्म और भक्ति", content: "समय का पूरा पूरा लाभ उठाना। सेवा, भजन-बन्दगी और सत्संग में दिल लगाना।" },
  { title: "10. सद्गुण", content: "सच्चाई, सहनशीलता, सन्तुष्टि आदि गुणों को अपने अन्दर समाहित करने का प्रयत्न करना।" },
  { title: "11. आत्म-सुधार", content: "दूसरों के अवगुणों पर दृष्टि न रखते हुए अपने अवगुणों का सुधार करना।" },
  { title: "12. भक्ति के सिद्धांत", content: "भक्ति के नियमों व सिद्धान्तों को अपनाना तथा श्री आज्ञा में सदा तत्पर रहना।" },
  { title: "13. गुरु-निष्ठा", content: "श्री सद्गुरुदेव जी महाराज के श्री चरणों में अटल श्रद्धा, भक्ति और विश्वास रखते हुए सदैव सद्गुरु की पवित्र आज्ञा व श्री मौज में प्रसन्न रहना।" },
  { title: "14. जीवन का लक्ष्य", content: "अपने लक्ष्य अर्थात् ‘जीवात्मा के कल्याण’ को हर समय याद रखना तथा क्रियात्मक जीवन बनाना।" },
  { title: "15. सकारात्मक दृष्टिकोण", content: "हर समय प्रसन्नचित्त रहना, क्योंकि प्रसन्नचित्त व्यक्ति ही प्रत्येक कार्य में सफलता प्राप्त कर सकता है। यह प्रसन्नता तथा शान्ति केवल सच्चे नाम से तथा उपरलिखित नियमों का पालन करने से ही प्राप्त हो सकती है।" },
  { title: "16. प्रशासन एवं अनुशासन", content: "श्री दरबार के नियमों पर चल कर श्री दरबार की प्रबन्धक-समिति के निर्देश का पालन करना।" }
];

const RULES_ENGLISH = [
  { title: "1. Morning Routine", content: "After waking up and finishing morning ablutions, perform Bhajan-Abhyas and Aarti-Puja with regular discipline. Thereafter, engage yourself in your respective Seva (service) tasks." },
  { title: "2. Spiritual Participation", content: "Attending Aarti-Puja at both times (morning and evening) and dedicating at least 2 hours daily to Bhajan-Abhyas is mandatory and essential." },
  { title: "3. Lifestyle", content: "Keep your desires under control, consume simple vegetarian food, and wear simple, modest clothing." },
  { title: "4. Celibacy", content: "Observance of Brahmacharya (celibacy) is compulsory for everyone." },
  { title: "5. Inner Conduct", content: "Do not harbor animosity, opposition, or malice towards anyone. Behave with everyone with goodwill, humility, and affection." },
  { title: "6. Use of Time", content: "Refrain from wasting time in arguments or vain talk. Spend your leisure hours studying the teachings of Saints (Swadhyaya) and participating in Satsang." },
  { title: "7. Purity of Character", content: "Maintain a pure and clean character. Stay away from untruthfulness and other vices." },
  { title: "8. Social Behavior", content: "Treat everyone with love, civility, and politeness." },
  { title: "9. Productivity", content: "Make the best use of your time. Devote your heart to Seva (service), Bhajan-Bandagi (worship), and Satsang." },
  { title: "10. Virtues", content: "Strive to cultivate virtues like truthfulness, tolerance, and contentment within yourself." },
  { title: "11. Self-Improvement", content: "Instead of focusing on the flaws of others, focus on improving your own shortcomings." },
  { title: "12. Devotional Principles", content: "Adopt the rules and principles of Bhakti and always remain ready to follow the \"Shri Agya\" (Divine Commands)." },
  { title: "13. Faith in Guru", content: "Maintain unwavering faith, devotion, and trust in the holy feet of Shri Sadgurudev Ji Maharaj, always remaining happy in his sacred commands and \"Shri Mauj\" (Divine Will)." },
  { title: "14. Life Goal", content: "Always remember your ultimate goal—the ‘welfare of the soul’—and lead a practical, purposeful life." },
  { title: "15. Positive Mindset", content: "Always remain cheerful, as only a cheerful person can achieve success in every task. This happiness and peace can only be attained through the \"True Name\" and by following the above-mentioned rules." },
  { title: "16. Administration", content: "Follow the rules of the \"Shri Darbar\" and comply with the instructions of the Management Committee of Shri Darbar." }
];

const RulesSection = () => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <div className="flex justify-center my-12" style={{ perspective: "1000px" }}>
      <motion.div
        className="relative w-full max-w-6xl bg-card rounded-2xl shadow-soft cursor-pointer text-gray-700 border border-gray-100"
        onClick={() => setIsFlipped(!isFlipped)}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d", minHeight: "1000px" }}
      >
        {/* Front (Hindi) */}
        <div className="absolute inset-0 p-8 md:p-12 flex flex-col" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-primaryDark mb-6 text-center leading-tight">
              श्री आनन्दपुर सत्संग आश्रम के शरणागत स्थायी निवासियों व प्रवासियों के लिए नियम
            </h2>
            <p className="mb-6 text-center font-medium text-lg text-primaryDark">
              प्रत्येक स्त्री-पुरुष के लिए जो श्री आनन्दपुर सत्संग आश्रम में स्थायी निवासी व प्रवासी हैं, निम्नलिखित नियमों का पालन आवश्यक एवं अनिवार्य है—
            </p>
            <div className="space-y-4 overflow-y-auto flex-grow pr-2 custom-scrollbar">
              {RULES_HINDI.map((rule, index) => (
                <div key={index} className="flex flex-col gap-1 mb-3">
                   <h3 className="text-lg font-bold text-highlight tracking-wide">{rule.title}</h3>
                   <p className="text-lg leading-relaxed">{rule.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-center flex justify-center">
                <button 
                  className="text-sm text-highlight font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-highlight rounded-full px-6 py-2 transition-all duration-300 hover:bg-highlight hover:text-white hover:shadow-lg transform hover:-translate-y-1"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    setIsFlipped(!isFlipped);
                  }}
                >

                    Click to Read in English <span className="text-lg">↻</span>
                </button>
            </div>
        </div>

        {/* Back (English) */}
        <div 
          className="absolute inset-0 p-8 md:p-12 flex flex-col" 
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: "rotateY(180deg)" }}
        >
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-primaryDark mb-6 text-center leading-tight">
              Rules for Permanent Residents and Visitors Taking Refuge at Shri Anandpur Satsang Ashram
            </h2>
            <p className="mb-6 text-center font-medium text-lg text-primaryDark">
              It is essential and mandatory for every man and woman who is a permanent resident or visitor at Shri Anandpur Satsang Ashram to follow the following rules:
            </p>
            <div className="space-y-4 overflow-y-auto flex-grow pr-2 custom-scrollbar">
              {RULES_ENGLISH.map((rule, index) => (
                <div key={index} className="flex flex-col gap-1 mb-3">
                   <h3 className="text-lg font-bold text-highlight tracking-wide">{rule.title}</h3>
                   <p className="text-lg leading-relaxed">{rule.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-center flex justify-center">
                <button 
                  className="text-sm text-highlight font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-highlight rounded-full px-6 py-2 transition-all duration-300 hover:bg-highlight hover:text-white hover:shadow-lg transform hover:-translate-y-1"
                  onClick={(e) => {
                    e.stopPropagation(); 
                    setIsFlipped(!isFlipped);
                  }}
                >

                    हिंदी में पढ़ने के लिए क्लिक करें <span className="text-lg">↻</span>
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

const About = () => {
  return (
    <div className="min-h-screen bg-neutral font-body">
      <main className="container mx-auto px-4 py-16 md:py-24 space-y-12">
        
        {/* --- Container 1: Title & Introduction --- */}
        <motion.div
          {...containerAnimation}
          whileHover={{ y: -8, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
          className="bg-card rounded-2xl shadow-soft hover:shadow-accent p-8 md:p-12 cursor-pointer"
        >
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-primaryDark">
              About Shri Adarsh Dham
            </h1>
            <p className="mt-2 text-lg text-highlight font-semibold">A Sanctuary for Spiritual Growth</p>
            <div className="w-24 h-1 bg-primary mx-auto my-6 rounded-full"></div>
            <p className="max-w-3xl mx-auto text-lg text-gray-700 leading-relaxed">
              Located on Ramnagar Road in Kashipur, Uttarakhand, Shri Adarsh Dham Ashram is a serene sanctuary enveloped by nature. Affiliated with Shri Anandpur Trust and founded by visionary spiritual leaders, the ashram is dedicated to the profound journey of spiritual growth and self-realization.
            </p>
          </div>
        </motion.div>

        {/* --- Two-Column Containers: Philosophy & Objectives --- */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div
            {...containerAnimation}
            whileHover={{ y: -8, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
            className="bg-card rounded-2xl shadow-soft hover:shadow-accent p-8 flex flex-col items-center text-center cursor-pointer"
          >
            <div className="text-5xl text-primary mb-4">
              <FaBookOpen />
            </div>
            <h2 className="text-2xl font-bold font-heading text-primaryDark mb-3">Spiritual Philosophy</h2>
            <p className="text-gray-700">
              Our philosophy is rooted in <strong>Bhakti-Paramarth</strong>, highlighting the eternal essence of pure devotion and spiritual knowledge.
            </p>
          </motion.div>

          <motion.div
            {...containerAnimation}
            whileHover={{ y: -8, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
            className="bg-card rounded-2xl shadow-soft hover:shadow-accent p-8 flex flex-col items-center text-center cursor-pointer"
          >
            <div className="text-5xl text-primary mb-4">
              <GiLotus />
            </div>
            <h2 className="text-2xl font-bold font-heading text-primaryDark mb-3">Our Objectives</h2>
            <p className="text-gray-700">
              To foster a deeper understanding of spirituality, promote selfless services (sewa), and cultivate the knowledge of self-realization.
            </p>
          </motion.div>
        </div>

        {/* --- Container 3: Activities & Seva --- */}
        <motion.div
          {...containerAnimation}
          whileHover={{ y: -8, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
          className="bg-card rounded-2xl shadow-soft hover:shadow-accent p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center cursor-pointer"
        >
          <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold font-heading text-primaryDark mb-4">Activities for the Soul</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                  We offer a variety of practices designed to quiet the mind and open the heart.
              </p>
              <ul className="space-y-3 text-gray-700 text-left">
                  <li className="flex items-center"><FaHandsHelping className="text-primary mr-3 text-xl" /> Meditation & Self-Reflection</li>
                  <li className="flex items-center"><FaHandsHelping className="text-primary mr-3 text-xl" /> Discourses on Spiritual Texts</li>
                  <li className="flex items-center"><FaHandsHelping className="text-primary mr-3 text-xl" /> Kirtans and Bhajans</li>
                  <li className="flex items-center"><FaHandsHelping className="text-primary mr-3 text-xl" /> Community Service (Sewa)</li>
              </ul>
          </div>
          <div className="hidden md:flex justify-center items-center">
              <FaHandsHelping className="text-9xl text-background" />
          </div>
        </motion.div>

        {/* --- Rules Section (Flippable) --- */}
        <RulesSection />
{/* 
        --- Container 4: Digital Sanctuary ---
        <motion.div
          {...containerAnimation}
          whileHover={{ y: -8, scale: 1.03, transition: { type: 'spring', stiffness: 300 } }}
          className="bg-card rounded-2xl shadow-soft hover:shadow-accent p-8 flex flex-col items-center text-center cursor-pointer"
        >
            <div className="text-5xl text-primary mb-4">
                <FaLaptopCode />
            </div>
            <h2 className="text-2xl font-bold font-heading text-primaryDark mb-3">Our Digital Sanctuary</h2>
            <p className="text-gray-700 max-w-2xl">
              This web application is an extension of our principle of sewa. It is designed to streamline event and accommodation management, allowing our community to seamlessly request lodging and stay updated.
            </p>
        </motion.div> */}

      </main>
    </div>
  );
};

export default About;