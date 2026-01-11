import React from 'react';
import { motion } from 'framer-motion';
import { FaBookOpen, FaHandsHelping, FaLaptopCode } from 'react-icons/fa';
import { GiLotus } from 'react-icons/gi';
import { useSelector } from 'react-redux';
import { useTranslation } from '../hooks/useTranslation';

const containerAnimation = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
};

const RULES_HINDI = [
  {
    title: "1.) प्रातःकालीन दिनचर्या:",
    content:
      "दिन की शुरुआत नियमित अनुशासन के साथ भजन-अभ्यास और आरती-पूजा से करें। तत्पश्चात प्रेमपूर्वक अपने संबंधित सेवा कार्य में लग जाएं।",
  },
  {
    title: "2.) आध्यात्मिक भागीदारी:",
    content:
      "आश्रम की पवित्रता बनाए रखने के लिए, दोनों समय (सुबह और शाम) आरती-पूजा में शामिल होना और प्रतिदिन कम से कम 2 घंटे भजन-अभ्यास के लिए समर्पित करना अनिवार्य है।",
  },
  {
    title: "3.) सरल और शुद्ध जीवन:",
    content:
      "आत्म-संयम का अभ्यास करें, सात्त्विक शाकाहारी भोजन ग्रहण करें और सादगीपूर्ण एवं शालीन वस्त्र चुनें, जिससे आंतरिक और बाहरी पवित्रता बनी रहे।",
  },
  {
    title: "4.) ब्रह्मचर्य:",
    content:
      "ब्रह्मचर्य का पालन सभी के लिए अनिवार्य है और इसे आध्यात्मिक विकास में सहायक एक पवित्र अनुशासन माना जाता है; इसका पूरी निष्ठा और सम्मान के साथ अनुसरण करें।",
  },
  {
    title: "5.) नेक आचरण विकसित करना:",
    content:
      "क्रोध या द्वेष की भावनाओं से बचें और सभी के साथ दया, विनम्रता, स्नेह और सद्भावना का व्यवहार करें।",
  },
  {
    title: "6.) समय का सार्थक उपयोग:",
    content:
      "वाद-विवाद या व्यर्थ की बातों में शामिल होने के बजाय, अपना समय स्वाध्याय (आध्यात्मिक शिक्षाओं का अध्ययन) और सत्संग में व्यतीत करें।",
  },
  {
    title: "7.) चरित्र की पवित्रता:",
    content:
      "आश्रम वातावरण की पवित्रता बनाए रखने के लिए मन, वचन और कर्म में ईमानदारी, सत्यनिष्ठा और नैतिक स्वच्छता बनाए रखें।",
  },
  {
    title: "8.) सामंजस्यपूर्ण सामाजिक जीवन:",
    content:
      "सभी व्यवहार शिष्टाचार, सम्मान और प्रेम से प्रेरित हों, जिससे सद्भाव और आपसी समझ का वातावरण बने।",
  },
  {
    title: "9.) समर्पित जीवन:",
    content:
      "प्रत्येक दिन का अधिकतम लाभ उठाते हुए अपने हृदय और प्रयासों को सेवा, भजन-बंदगी और सत्संग में समर्पित करें।",
  },
  {
    title: "10.) आंतरिक गुणों का पोषण:",
    content:
      "सचेत अभ्यास के माध्यम से सत्य, सहनशीलता, धैर्य, संतोष और करुणा जैसे गुणों को विकसित करें।",
  },
  {
    title: "11.) आत्म-सुधार:",
    content:
      "दूसरों की कमियों पर ध्यान केंद्रित करने के बजाय, अपनी स्वयं की कमियों को सुधारने पर ध्यान दें।",
  },
  {
    title: "12.) भक्ति के सिद्धांत:",
    content:
      "भक्ति के सिद्धांतों को अपनाएं और खुले मन से श्री आज्ञा का पालन करने के लिए तत्पर रहें।",
  },
  {
    title: "13.) गुरु-निष्ठा:",
    content:
      "श्री सद्गुरुदेव जी महाराज के श्री चरणों में अटल श्रद्धा, भक्ति और विश्वास रखते हुए सदैव सद्गुरु की पवित्र आज्ञा व श्री मौज में प्रसन्न रहें।",
  },
  {
    title: "14.) जीवन का लक्ष्य:",
    content:
      "हमेशा अपने जीवन के लक्ष्य— \"आत्मा का कल्याण\" —को याद रखें और एक व्यावहारिक एवं उद्देश्यपूर्ण जीवन जिएं।",
  },
  {
    title: "15.) सकारात्मक दृष्टिकोण:",
    content:
      "प्रसन्नचित्त रहें, क्योंकि प्रसन्नचित्त व्यक्ति ही प्रत्येक कार्य में सफलता प्राप्त कर सकता है। यह प्रसन्नता तथा शांति केवल सच्चे नाम से तथा उपर्युक्त नियमों का पालन करने से ही प्राप्त हो सकती है।",
  },
  {
    title: "16.) अनुशासन:",
    content:
      "सभी भक्तों और आगंतुकों से विनम्र अनुरोध है कि वे श्री दरबार के नियमों और दिशा-निर्देशों का सम्मान करें और प्रबंधन समिति के मार्गदर्शन में सहयोग करें।",
  },
];


const RULES_ENGLISH = [
  { title: "1. Morning Routine:", content: "Begin the day with Bhajan-Abhyas and Aarti-Puja with regular discipline. Thereafter lovingly engage in your assigned Seva (service)." },
  { title: "2. Spiritual Participation:", content: "To maintain the sanctity of the Ashram, attending Aarti-Puja at both times (morning and evening), and dedicating at least 2 hours daily to Bhajan-Abhyas, is mandatory." },
  { title: "3. Simple and Pure Living:", content: "Practice self-restraint, partake in simple vegetarian meals, and choose modest, simple attire, fostering inner and outer purity." },
  { title: "4. Brahmacharya:", content: "The observance of Brahmacharya is compulsory for everyone and is regarded as a sacred discipline to support spiritual growth. Follow it with full dedication and respect." },
  { title: "5. Cultivating Noble Conduct:", content: "Avoid feelings of resentment or ill-will and interact with all beings with kindness, humility, affection, and goodwill." },
  { title: "6. Meaningful Use of Time:", content: "Instead of engaging in arguments or idle conversations, spend time in Swadhyaya (study of spiritual teachings) and participation in Satsang." },
  { title: "7. Purity of Character:", content: "Maintain honesty, integrity, and moral cleanliness in thought, word, and deed to preserve the sanctity of the Ashram environment." },
  { title: "8. Harmonious Social Life:", content: "Let all interactions be guided by courtesy, respect, and love, creating an atmosphere of harmony and mutual understanding." },
  { title: "9. Dedicated Living:", content: "Make the most of each day by dedicating your heart and efforts to Seva (service), Bhajan-Bandagi (worship), and Satsang." },
  { title: "10. Nurturing Inner Virtues:", content: "Through mindful practice, cultivate virtues such as truthfulness, tolerance, patience, contentment, and compassion." },
  { title: "11. Self-Improvement:", content: "Instead of focusing on the flaws of others, focus on improving your own shortcomings." },
  { title: "12. Path of Devotion:", content: "Embrace the principles of Bhakti and remain open-hearted and ready to follow the sacred Shri Agya (Divine Guidance)." },
  { title: "13. Faith in the Guru:", content: "Maintain unwavering faith, devotion, trust and remain joyfully align with the holy guidance of Shri Sadgurudev Ji Maharaj, accepting His divine will (Shri Mauj) with gratitude." },
  { title: "14. Remember Life’s Goal:", content: "Always remember your ultimate goal — the “welfare and awakening of the soul” — and lead a practical, purposeful life." },
  { title: "15. A Cheerful and Peaceful Spirit:", content: "Nurture cheerfulness and inner peace, as these are the foundations of true success and are attained through the True Name and the observance of these gentle disciplines." },
  { title: "16. Respecting the Ashram’s Order:", content: "All devotees and visitors are kindly requested to honor the traditions and guidelines of Shri Darbar and to cooperate with the guidance of the Management Committee, so that the sacred atmosphere of the Ashram may be preserved for all." }
];

const RulesSection = () => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  return (
    <div className="flex justify-center my-12" style={{ perspective: "1500px" }}>
      <motion.div
        className="relative w-full max-w-7xl bg-card rounded-2xl shadow-soft cursor-pointer text-gray-700 border border-gray-100 grid"
        onClick={() => setIsFlipped(!isFlipped)}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front (English - Default) */}
        <div 
          className="col-start-1 row-start-1 p-8 md:p-12 flex flex-col" 
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
            <h2 className="text-2xl md:text-4xl font-bold font-heading text-primaryDark mb-6 text-center leading-tight">
              Guidelines & Rules for Devotees and Visitors of Shri Anandpur Satsang Ashram (Shri Adarsh Dham)
            </h2>
            <p className="mb-6 text-center font-medium text-lg text-primaryDark max-w-4xl mx-auto">
              To preserve the divine tranquility and sacred vibration of the Ashram, we humbly request all our permanent residents and visitors to gracefully embrace the following guidelines:
            </p>
            <div className="space-y-6">
              {RULES_ENGLISH.map((rule, index) => (
                <div key={index} className="flex flex-col gap-1 pb-2 border-b border-gray-300/30 last:border-0">
                   <h3 className="text-xl font-bold text-highlight tracking-wide">{rule.title}</h3>
                   <p className="text-lg leading-relaxed text-gray-800">{rule.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 text-center flex justify-center">
                <button 
                  className="text-base text-highlight font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-highlight rounded-full px-8 py-3 transition-all duration-300 hover:bg-highlight hover:text-white hover:shadow-lg transform hover:-translate-y-1 "
                  onClick={(e) => {
                    e.stopPropagation(); 
                    setIsFlipped(true);
                  }}
                >
                    Click to Read in Hindi <span className="text-xl">↻</span>
                </button>
            </div>
        </div>

        {/* Back (Hindi) */}
        <div className="col-start-1 row-start-1 p-8 md:p-12 flex flex-col" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: "rotateY(180deg)" }}>
            <h2 className="text-2xl md:text-4xl font-bold font-heading text-primaryDark mb-6 text-center leading-tight">
              श्री आनंदपुर सत्संग आश्रम (श्री आदर्श धाम) के शरणागत स्थायी निवासियों और आगंतुकों के लिए दिशा-निर्देश एवं नियम
            </h2>
            <p className="mb-6 text-center font-medium text-lg text-primaryDark max-w-4xl mx-auto" style={{ fontFamily: 'serif' }}>
              आश्रम की दिव्य शांति और पवित्र स्पंदन को बनाए रखने के लिए, हम अपने सभी स्थायी निवासियों और आगंतुकों से विनम्रतापूर्वक निम्नलिखित दिशा-निर्देशों को सहर्ष अपनाने का अनुरोध करते हैं:
            </p>
            <div className="space-y-6">
              {RULES_HINDI.map((rule, index) => (
                <div key={index} className="flex flex-col gap-1 pb-2 border-b border-gray-300/30 last:border-0">
                   <h3 className="text-xl font-bold text-highlight tracking-wide" style={{ fontFamily: 'serif' }}>{rule.title}</h3>
                   <p className="text-lg leading-loose text-gray-800" style={{ fontFamily: 'serif' }}>{rule.content}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200 text-center flex justify-center">
                <button 
                  className="text-base text-highlight font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-highlight rounded-full px-8 py-3 transition-all duration-300 hover:bg-highlight hover:text-white hover:shadow-lg transform hover:-translate-y-1 "
                  onClick={(e) => {
                    e.stopPropagation(); 
                    setIsFlipped(false);
                  }}
                >
                    अंग्रेजी में पढ़ने के लिए क्लिक करें <span className="text-xl">↻</span>
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

const About = () => {
  const t = useTranslation();

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
              {t.about.title}
            </h1>
            <p className="mt-2 text-lg text-highlight font-semibold">{t.about.subtitle}</p>
            <div className="w-24 h-1 bg-primary mx-auto my-6 rounded-full"></div>
            <p className="max-w-3xl mx-auto text-lg text-gray-700 leading-relaxed">
              {t.about.desc}
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
            <h2 className="text-2xl font-bold font-heading text-primaryDark mb-3">{t.about.philosophy.title}</h2>
            <p className="text-gray-700">
              {t.about.philosophy.desc}
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
            <h2 className="text-2xl font-bold font-heading text-primaryDark mb-3">{t.about.objectives.title}</h2>
            <p className="text-gray-700">
              {t.about.objectives.desc}
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
              <h2 className="text-3xl font-bold font-heading text-primaryDark mb-4">{t.about.activities.title}</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                  {t.about.activities.desc}
              </p>
              <ul className="space-y-3 text-gray-700 text-left">
                  {t.about.activities.list.map((item, index) => (
                    <li key={index} className="flex items-center"><FaHandsHelping className="text-primary mr-3 text-xl" /> {item}</li>
                  ))}
              </ul>
          </div>
          <div className="hidden md:flex justify-center items-center">
              <FaHandsHelping className="text-9xl text-background" />
          </div>
        </motion.div>

        {/* --- Rules Section (Flippable) --- */}
        <RulesSection />

      </main>
    </div>
  );
};

export default About;
