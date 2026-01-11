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
  { title: "1.) प्रातःकािीन नदनचया:", content: "नदन की र्ुरुआत ननयनमत अनुर्ासन के साथ भजन-अभ्यास और आरती-पूजा सेकरं।तत्पश्चात प्रेमपूवशक अपनेसम्बनधधत सेवा कायशमं िग जाएं।" },
  { title: "2.) आध्यानत्मक भागीदारी:", content: "आश्रम की पनवत्रता बनाए रखनेके निए, दोनं समय (सुबह और र्ाम) आरती-पूजा मं र्ानमि होना और प्रनतनदन कम सेकम 2 घंटेभजन-अभ्यास के निए समनपशत करना अननवायशहै।" },
  { title: "3.) सरि और र्ुद्ध जीवन:", content: "आत्म-संयम का अभ्यास करं, सानत्वक र्ाकाहारी भोजन ग्रहण करंऔर सादगीपूणशएवं र्ािीन वस्त्र चुनं, नजससेआंतररक और बाहरी पनवत्रता बनी रहे।" },
  { title: "4.) ब्रह्मचय:श", content: "ब्रह्मचयशका पािन सभी के निए अननवायशहैऔर इसेआध्यानत्मक नवकास मं सहायक एक पनवत्र अनुर्ासन माना जाता है; इसका पूरी ननष्ठा और सम्मान के साथ अनुसरण करं।" },
  { title: "5.) नेक आचरण नवकनसत करना:", content: "क्रोध या द्वेर् की भावनाओं सेबचं और सभी के साथ दया, नवनम्रता, स्नेह और सद्भावना का व्यवहार करं।" },
  { title: "6.) समय का साथशक उपयोग:", content: "वाद-नववाद या व्यथश की बातं मं र्ानमि होनेके बजाय, अपना समय स्वाध्याय (आध्यानत्मक नर्क्षाओं का अध्ययन) और सत्संग मं व्यतीत करं।" },
  { title: "7.) चररत्र की पनवत्रता:", content: "आश्रम वातावरण की पनवत्रता बनाए रखनेके निए मन, वचन और कमश मं ईमानदारी, सत्यननष्ठा और नैनतक स्वच्छता बनाए रखं।" },
  { title: "8.) सामंजस्यपूणशसामानजक जीवन:", content: "सभी व्यवहार नर्ष्टाचार, सम्मान और प्रेम सेप्रेररत हं, नजससेसद्भाव और आपसी समझ का वातावरण बने।" },
  { title: "9.) समनपशत जीवन:", content: "प्रत्येक नदन का अनधकतम िाभ उठातेहुए अपनेहृदय और प्रयासं को सेवा, भजन-बंदगी और सत्संग मं समनपशत करं।" },
  { title: "10.) आंतररक गुणं का पोर्ण:", content: "सचेत अभ्यास के माध्यम सेसत्य, सहनर्ीिता, धैय,श संतोर् और करुणा जैसेगुणं को नवकनसत करं।" },
  { title: "11.) आत्म-सुधार:", content: "दूसरं की कनमयं पर ध्यान कंनित करनेके बजाय, अपनी स्वयं की कनमयं को सुधारनेपर ध्यान दं।" },
  { title: "12. भनतत के नसद्धंत:", content: "भनतत के नसद्धंतं को अपनाएं और खुिेमन सेश्री आज्ञा का पािन करनेके निए तत्पर रहं।" },
  { title: "13.) गुरु-ननष्ठा:", content: "श्री सद्गुरुदेव जी महाराज के श्री चरणं मं अटि श्रद्धा, भनतत और नवश्वास रखते हुए सदैव सद्गुरु की पनवत्र आज्ञा व श्री मौज मं प्रसन्न रहं।" },
  { title: "14.) जीवन का िक्ष्य:", content: "हमेर्ा अपनेअंनतम िक्ष्य— \"आत्मा का कल्याण\" —को याद रखं और एक व्यावहारिक एवं उद्देश्यपूणशजीवन नजएं।" },
  { title: "15.) सकारात्मक दनष्टकोण ृ :", content: "प्रसन्ननचत्त रहं, तयंनक प्रसन्ननचत्त व्यनतत ही प्रत्येक कायशमं सफिता प्राप्त कर सकता है।यह प्रसन्नता तथा र्ानधत केवि सच्चेनाम सेतथा उपरनिनखत ननयमं का पािन करनेसेही प्राप्त हो सकती है।" },
  { title: "16.) अनुर्ासन:", content: "सभी भततं और आगंतुकं सेनवनम्र अनुरोध हैनक वेश्री दरबार के ननयमं और नदर्ा-ननदेर्ं का सम्मान करंऔर प्रबंधन सनमनत के मागदर्शन मं सहयोग कर श ं।" }
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