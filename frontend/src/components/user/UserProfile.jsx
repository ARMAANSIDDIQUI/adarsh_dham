import React from 'react';
import { motion } from 'framer-motion';
import UpdateProfileForm from './UpdateProfileForm';
import ChangePasswordForm from './ChangePasswordForm';
import { useTranslation } from '../../hooks/useTranslation';

const UserProfile = () => {

    const t = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 md:p-8 bg-neutral min-h-screen font-body"
        >
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 pb-4 border-b-2 border-background text-center">
                    <h2 className="text-3xl font-bold font-heading text-primaryDark">{t.profile.title}</h2>
                    <p className="text-gray-700 mt-2">{t.profile.desc}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <UpdateProfileForm />
                    <ChangePasswordForm />
                </div>
            </div>
        </motion.div>
    );
};

export default UserProfile;
