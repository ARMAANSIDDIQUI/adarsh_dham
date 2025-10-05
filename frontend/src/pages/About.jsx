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

        {/* --- Container 4: Digital Sanctuary --- */}
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
        </motion.div>

      </main>
    </div>
  );
};

export default About;