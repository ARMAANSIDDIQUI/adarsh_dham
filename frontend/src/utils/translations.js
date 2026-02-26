export const translations = {
  en: {
    // Navigation
    nav: {
      home: "Home",
      about: "About",
      calendar: "Calendar",
      eventList: "Event List",
      requestBooking: "Request Booking",
      comments: "Comments",
      contact: "Contact",
      myBookings: "My Bookings",
      notifications: "Notifications",
      notificationsHistory: "Notifications History",
      myProfile: "My Profile",
      adminPanel: "Admin Panel",
      login: "Login",
      register: "Register",
      logout: "Logout",
    },
    // Common / Global
    common: {
      submit: "Submit",
      cancel: "Cancel",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      welcome: "Welcome",
      search: "Search",
      viewDetails: "View Details",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      close: "Close",
    },
    // Language
    language: {
      select: "Select Language",
      english: "English",
      hindi: "Hindi",
      toggleTitle: "Change Language"
    },
    // Home Page
    home: {
      carousel: {
        slide1: {
          title: "Discover Spiritual Serenity",
          subtitle: "Experience the divine architecture and peaceful environment of Shri Adarsh Dham."
        },
        slide2: {
          title: "Join Our Vibrant Celebrations",
          subtitle: "Never miss a festival! Check our calendar and participate in sacred events."
        },
        slide3: {
          title: "Comfortable & Devotional Stay",
          subtitle: "Easily book peaceful accommodation for yourself and your family during your visit."
        }
      },
      live: {
        watch: "Watch Live",
      },
      features: {
        title: "Key Features",
        calendar: {
          title: "Event Calendar",
          desc: "Stay updated on all our spiritual and community events."
        },
        booking: {
          title: "Accommodation Booking",
          desc: "Effortlessly request and manage stay for any event."
        }
      },
      timings: {
        title: "Mandir Darshan Timings",
      },
      quickLinks: {
        title: "Quick Links",
        myBookings: "My Bookings",
        events: "Events",
        calendar: "Calendar"
      },
      footer: {
        desc: "Dedicated to spiritual guidance and community welfare in Uttarakhand.",
        connect: "Connect",
        getInTouch: "Get in Touch",
        rights: "All rights reserved.",
        viewMap: "View Location on Map"
      }
    },
    // About Page
    about: {
      title: "About Shri Adarsh Dham",
      subtitle: "A Sanctuary for Spiritual Growth",
      desc: "Located on Ramnagar Road in Kashipur, Uttarakhand, Shri Adarsh Dham Ashram is a serene sanctuary enveloped by nature. Affiliated with Shri Anandpur Trust and founded by visionary spiritual leaders, the ashram is dedicated to the profound journey of spiritual growth and self-realization.",
      philosophy: {
        title: "Spiritual Philosophy",
        desc: "Our philosophy is rooted in Bhakti-Paramarth, highlighting the eternal essence of pure devotion and spiritual knowledge."
      },
      objectives: {
        title: "Our Objectives",
        desc: "To foster a deeper understanding of spirituality, promote selfless services (sewa), and cultivate the knowledge of self-realization."
      },
      activities: {
        title: "Activities for the Soul",
        desc: "We offer a variety of practices designed to quiet the mind and open the heart.",
        list: [
          "Meditation & Self-Reflection",
          "Discourses on Spiritual Texts",
          "Kirtans and Bhajans",
          "Community Service (Sewa)"
        ]
      },
      rules: {
        title: "Guidelines & Rules for Devotees and Visitors of Shri Anandpur Satsang Ashram (Shri Adarsh Dham)",
        intro: "To preserve the divine tranquility and sacred vibration of the Ashram, we humbly request all our permanent residents and visitors to gracefully embrace the following guidelines:",
        button: "Click to Read in Hindi"
      }
    },
    // Contact Page
    contact: {
      title: "Contact Us",
      intro: "For any inquiries regarding accommodations, events, or general information, please feel free to reach out to us. We are here to help.",
      address: {
        title: "Address",
        text: "Shri Adarsh Dham, 9th KM Stone, Kashipur-Ramnagar Road, Village Bhogpur, Kashipur (Uttarakhand) Pin-244713"
      },
      email: {
        title: "Email",
      },
      phone: {
        title: "Phone",
        timing: "Timing:",
      },
      form: {
        title: "Send Us a Message",
        name: "Name",
        email: "Email",
        message: "Message",
        placeholderName: "Your Full Name",
        placeholderEmail: "your.email@example.com",
        placeholderMessage: "How can we help you?",
        send: "Send Message",
        success: "Your message has been sent successfully!",
        error: "Failed to send message. Please try again later."
      },
      map: {
        title: "Find Us",
      }
    },
    // Login Page
    login: {
      title: "Login to your Account",
      phoneLabel: "Phone Number",
      phonePlaceholder: "Phone Number",
      passwordLabel: "Password",
      passwordPlaceholder: "Password",
      forgotPassword: "Forgot password?",
      button: "Login",
      loggingIn: "Logging in...",
      noAccount: "Don't have an account?",
      registerHere: "Register here",
      error: {
        phoneLength: "Phone number must be exactly 10 digits.",
        required: "Password is required.",
        generic: "Login failed. Please check your credentials.",
        success: "Logged in successfully!"
      }
    },
    // Register Page
    register: {
      title: "Create Account",
      nameLabel: "Full Name",
      phoneLabel: "Phone Number",
      passwordLabel: "Password",
      confirmPasswordLabel: "Confirm Password",
      phonePlaceholder: "10-digit mobile number",
      button: "Register",
      registering: "Registering...",
      alreadyAccount: "Already have an account?",
      loginHere: "Login here",
      error: {
        nameRequired: "Full name is required.",
        phoneLength: "Phone number must be exactly 10 digits.",
        passwordLength: "Password must be at least 6 characters long.",
        passwordMatch: "Passwords do not match.",
        generic: "Registration failed. Please try again.",
        success: "Registration successful! Redirecting to login..."
      }
    },
    // Events Page
    events: {
      allEvents: "All Events",
      calendar: "Calendar",
      searchPlaceholder: "Search events...",
      nextEvent: "Next Event",
      upcomingEvents: "Upcoming Events",
      ongoingEvents: "Ongoing Events",
      finishedEvents: "Finished Events",
      loading: "Loading events...",
      error: "Failed to fetch events. Please try again later.",
      bookingDates: "Booking Dates",
      eventInProgress: "Event In Progress",
      eventsOn: "Events on",
      bookingOpenFor: "Booking open for",
      inProgress: "in progress",
      noEvents: "No upcoming events found.",
      // Event Card
      card: {
        location: "Location",
        dates: "Dates",
        bookingWindow: "Booking Window",
        liveLinks: "Live Stream Links",
        requestBooking: "Request Booking",
        bookingClosed: "Booking Closed",
        bookingNotStarted: "Bookings not started yet"
      }
    },
    // Booking Form
    booking: {
      title: "Request Accommodation for",
      editTitle: "Edit Your Booking",
      submittedTitle: "Booking Submitted!",
      submittedDesc: "Your accommodation request has been successfully submitted. Please check the **My Bookings** section for status updates.",
      goToCalendar: "Go to Calendar",
      submitSuccess: "Booking request submitted successfully!",
      submitError: "Failed to submit booking request.",
      updateButton: "Update Booking",
      submitButton: "Submit Request",
      submitting: "Submitting...",
      sections: {
        stay: "Period of Stay",
        ashram: "Ashram & Reference Details",
        personal: "Your Details",
        group: "Group Details",
        additional: "Additional Information"
      },
      fields: {
        from: "From",
        to: "To",
        ashramName: "Ashram Name",
        baijiName: "Baiji / Mahatma Ji Name",
        baijiContact: "Baiji / Mahatma Ji Contact",
        email: "Email (Optional)",
        contact: "Contact Number",
        address: "Address",
        city: "City",
        fillingForOthers: "Are you filling this form for others?",
        memberDetails: "Member Details",
        males: "Males",
        females: "Females",
        boys: "Boys",
        girls: "Girls",
        name: "Name",
        age: "Age",
        notes: "Special Requests / Notes"
      },
      notices: {
        stayFrom: "Please note: You may opt for stay from 5 days before the event begins.",
        stayTo: "Please note: You may opt for stay up to 5 days after the event concludes.",
        yes: "Yes",
        no: "No"
      },
      errors: {
        loadingEvent: "Loading...",
        eventNotFound: "Event not found. Please try again later.",
        addPerson: "You must add at least one person.",
        ageLimit: "Age for {name} ({gender}) is over 16.",
        baijiRequired: "Baiji / Mahatma Ji's name and contact are mandatory.",
        contactLength: "Please enter a valid 10-digit contact number.",
        baijiContactLength: "Please enter a valid 10-digit Baiji / Mahatma Ji contact number.",
        dateOrder: "Stay 'From' date cannot be after 'To' date."
      },
      genders: {
        male: "Male",
        female: "Female",
        boy: "Boy",
        girl: "Girl"
      }
    },
    // Comments Page
    comments: {
      title: "Comments & Reviews",
      leaveReview: "Leave a Review",
      placeholder: "Share your experience...",
      submit: "Submit Review",
      submitting: "Submitting...",
      loginPrompt: "Please",
      loginLink: "log in",
      loginSuffix: "to leave a comment or review.",
      noComments: "No comments yet. Be the first to leave a review!",
      anonymous: "Anonymous",
      deleteTitle: "Confirm Deletion",
      deleteMessage: "Are you sure you want to permanently delete this comment?",
      deleteButton: "Delete",
      error: {
        empty: "Comment cannot be empty.",
        submitSuccess: "Your comment has been submitted for review!",
        submitFail: "Failed to submit comment.",
        fetchFail: "Failed to fetch comments.",
        deleteSuccess: "Your comment has been deleted.",
        deleteFail: "Failed to delete comment."
      }
    },
    // My Bookings Page
    myBookings: {
      title: "My Bookings",
      searchPlaceholder: "Search by booking number or event...",
      noBookings: {
        title: "No Bookings Found",
        desc: "You haven't made any bookings yet. Explore events and make your first booking!",
        button: "Browse Events"
      },
      noMatch: "No bookings match your search.",
      status: {
        approved: "Approved",
        pending: "Pending",
        declined: "Declined"
      },
      card: {
        details: "Event Details",
        requested: "Requested:",
        allocation: "Allocation Details:",
        room: "Room",
        bed: "Bed",
        downloadPass: "Download Pass",
        edit: "Edit",
        withdraw: "Withdraw",
        declinedMsg: "Booking declined.",
        pendingMsg: "Booking pending approval."
      },
      actions: {
        withdrawConfirm: "Are you sure you want to withdraw this booking? This action cannot be undone.",
        withdrawSuccess: "Booking withdrawn successfully.",
        withdrawFail: "Failed to withdraw booking.",
        updateSuccess: "Booking updated and is now pending re-approval.",
        fetchFail: "Failed to fetch bookings."
      }
    },
    // Notifications Page
    notifications: {
      title: "My Notifications",
      markAll: "Mark All as Read",
      marking: "Marking...",
      markingAll: "Marking all...",
      loading: "Loading notifications...",
      fetchFail: "Failed to fetch notifications.",
      noNotifications: "No notifications yet.",
      markAsRead: "Mark as Read",
      received: "Received"
    },
    // Profile Page
    profile: {
      title: "My Profile",
      desc: "Manage your personal information and password.",
      updateForm: {
        name: "Name",
        phone: "Phone Number",
        phoneNotice: "Phone number cannot be changed.",
        button: "Update Details",
        updating: "Updating...",
        success: "Profile updated successfully!",
        error: "Profile update failed. Please try again.",
        email: "Email",
        verified: "Verified",
        unverified: "Unverified",
        editEmail: "Edit Email",
        verifyEmail: "Verify Email",
        resendOtp: "Resend OTP",
        enterOtp: "Enter OTP",
        checkEmailCode: "Check your email for the code.",
        verifyAndUpdate: "Verify Code & Update Details"
      },
      passwordForm: {
        title: "Change Password",
        current: "Current Password",
        currentPlaceholder: "Enter your current password",
        new: "New Password",
        newPlaceholder: "Minimum 6 characters",
        confirm: "Confirm New Password",
        confirmPlaceholder: "Re-enter new password",
        button: "Update Password",
        updating: "Updating...",
        success: "Password changed successfully!",
        error: "Failed to change password.",
        lengthError: "New password must be at least 6 characters long.",
        matchError: "New passwords do not match."
      }
    }
  },
  hi: {
    // ... existing navigation, common, language, home, about, contact, login, register, events ...
    nav: {
      home: "मुखपृष्ठ", // Home
      about: "हमारे बारे में", // About Us
      calendar: "कैलेंडर", // Calendar
      eventList: "कार्यक्रम सूची", // Event List
      requestBooking: "बुकिंग अनुरोध", // Request Booking
      comments: "टिप्पणियाँ", // Comments
      contact: "संपर्क करें", // Contact
      myBookings: "मेरी बुकिंग", // My Bookings
      notifications: "सूचनाएं", // Notifications
      notificationsHistory: "सूचना इतिहास", // Notifications History
      myProfile: "मेरा प्रोफाइल", // My Profile
      adminPanel: "एडमिन पैनल", // Admin Panel
      login: "लॉग इन", // Login
      register: "पंजीकरण", // Register
      logout: "लॉग आउट", // Logout
    },
    common: {
      submit: "जमा करें", // Submit
      cancel: "रद्द करें", // Cancel
      loading: "लोड हो रहा है...", // Loading
      error: "त्रुटि", // Error
      success: "सफल", // Success
      welcome: "स्वागत है", // Welcome
      search: "खोजें", // Search
      viewDetails: "विवरण देखें", // View Details
      edit: "संपादित करें", // Edit
      delete: "हटाएं", // Delete
      save: "सहेजें", // Save
      close: "बंद करें", // Close
    },
    language: {
      select: "भाषा चुनें",
      english: "अंग्रेज़ी",
      hindi: "हिंदी",
      toggleTitle: "भाषा बदलें"
    },
    home: {
      carousel: {
        slide1: {
          title: "आध्यात्मिक शांति की खोज करें",
          subtitle: "श्री आदर्श धाम की दिव्य वास्तुकला और शांतिपूर्ण वातावरण का अनुभव करें।"
        },
        slide2: {
          title: "हमारे जीवंत उत्सवों में शामिल हों",
          subtitle: "कभी कोई त्यौहार न चूकें! हमारे कैलेंडर की जाँच करें और पवित्र आयोजनों में भाग लें।"
        },
        slide3: {
          title: "आरामदायक और भक्तिमय प्रवास",
          subtitle: "अपनी यात्रा के दौरान अपने और अपने परिवार के लिए आसानी से शांतिपूर्ण आवास बुक करें।"
        }
      },
      live: {
        watch: "सीधा देखें",
      },
      features: {
        title: "प्रमुख विशेषताएँ",
        calendar: {
          title: "कार्यक्रम कैलेंडर",
          desc: "हमारे सभी आध्यात्मिक और सामुदायिक कार्यक्रमों से अपडेट रहें।"
        },
        booking: {
          title: "आवास बुकिंग",
          desc: "किसी भी कार्यक्रम के लिए आसानी से प्रवास का अनुरोध और प्रबंधन करें।"
        }
      },
      timings: {
        title: "मंदिर दर्शन का समय",
      },
      quickLinks: {
        title: "त्वरित लिंक",
        myBookings: "मेरी बुकिंग",
        events: "कार्यक्रम",
        calendar: "कैलेंडर"
      },
      footer: {
        desc: "उत्तराखंड में आध्यात्मिक मार्गदर्शन और सामुदायिक कल्याण के लिए समर्पित।",
        connect: "जुड़ें",
        getInTouch: "संपर्क करें",
        rights: "सर्वाधिकार सुरक्षित।",
        viewMap: "मानचित्र पर स्थान देखें"
      }
    },
    about: {
      title: "श्री आदर्श धाम के बारे में",
      subtitle: "आध्यात्मिक विकास के लिए एक अभयारण्य",
      desc: "रामनगर रोड, काशीपुर, उत्तराखंड में स्थित, श्री आदर्श धाम आश्रम प्रकृति की गोद में बसा एक शांत अभयारण्य है। श्री आनंदपुर ट्रस्ट से संबद्ध और दूरदर्शी आध्यात्मिक गुरुओं द्वारा स्थापित, यह आश्रम आध्यात्मिक विकास और आत्म-साक्षात्कार की गहन यात्रा के लिए समर्पित है।",
      philosophy: {
        title: "आध्यात्मिक दर्शन",
        desc: "हमारा दर्शन भक्ति-परमार्थ में निहित है, जो शुद्ध भक्ति और आध्यात्मिक ज्ञान के शाश्वत सार को उजागर करता है।"
      },
      objectives: {
        title: "हमारे उद्देश्य",
        desc: "आध्यात्मिकता की गहरी समझ को बढ़ावा देना, निस्वार्थ सेवा (सेवा) को प्रोत्साहित करना और आत्म-साक्षात्कार के ज्ञान को विकसित करना।"
      },
      activities: {
        title: "आत्मा के लिए गतिविधियाँ",
        desc: "हम मन को शांत करने और हृदय को खोलने के लिए विभिन्न प्रथाओं की पेशकश करते हैं।",
        list: [
          "ध्यान और आत्म-चिंतन",
          "आध्यात्मिक ग्रंथों पर प्रवचन",
          "कीर्तन और भजन",
          "सामुदायिक सेवा (सेवा)"
        ]
      },
      rules: {
        title: "श्री आनंदपुर सत्संग आश्रम (श्री आदर्श धाम) के शरणागत स्थायी निवासियों और आगंतुकों के लिए दिशा-निर्देश एवं नियम",
        intro: "आश्रम की दिव्य शांति और पवित्र स्पंदन को बनाए रखने के लिए, हम अपने सभी स्थायी निवासियों और आगंतुकों से विनम्रतापूर्वक निम्नलिखित दिशा-निर्देशों को सहर्ष अपनाने का अनुरोध करते हैं:",
        button: "अंग्रेजी में पढ़ने के लिए क्लिक करें"
      }
    },
    contact: {
      title: "संपर्क करें",
      intro: "आवास, कार्यक्रमों या सामान्य जानकारी के संबंध में किसी भी पूछताछ के लिए, कृपया हमसे बेझिझक संपर्क करें। हम यहाँ मदद करने के लिए हैं।",
      address: {
        title: "पता",
        text: "श्री आदर्श धाम, 9वां किमी स्टोन, काशीपुर-रामनगर रोड, ग्राम भोगपुर, काशीपुर (उत्तराखंड) पिन-244713"
      },
      email: {
        title: "ईमेल",
      },
      phone: {
        title: "फ़ोन",
        timing: "समय:",
      },
      form: {
        title: "हमें संदेश भेजें",
        name: "नाम",
        email: "ईमेल",
        message: "संदेश",
        placeholderName: "आपका पूरा नाम",
        placeholderEmail: "आपका.email@example.com",
        placeholderMessage: "हम आपकी कैसे मदद कर सकते हैं?",
        send: "संदेश भेजें",
        success: "आपका संदेश सफलतापूर्वक भेज दिया गया है!",
        error: "संदेश भेजने में विफल। कृपया बाद में पुनः प्रयास करें।"
      },
      map: {
        title: "हमें खोजें",
      }
    },
    login: {
      title: "अपने खाते में लॉग इन करें",
      phoneLabel: "फ़ोन नंबर",
      phonePlaceholder: "फ़ोन नंबर",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "पासवर्ड",
      forgotPassword: "पासवर्ड भूल गए?",
      button: "लॉग इन",
      loggingIn: "लॉग इन हो रहा है...",
      noAccount: "क्या आपके पास खाता नहीं है?",
      registerHere: "यहाँ रजिस्टर करें",
      error: {
        phoneLength: "फ़ोन नंबर ठीक 10 अंकों का होना चाहिए।",
        required: "पासवर्ड आवश्यक है।",
        generic: "लॉगिन विफल। कृपया अपनी साख की जाँच करें।",
        success: "सफलतापूर्वक लॉग इन किया गया!"
      }
    },
    register: {
      title: "खाता बनाएं",
      nameLabel: "पूरा नाम",
      phoneLabel: "फ़ोन नंबर",
      passwordLabel: "पासवर्ड",
      confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
      phonePlaceholder: "10 अंकों का मोबाइल नंबर",
      button: "रजिस्टर",
      registering: "पंजीकरण हो रहा है...",
      alreadyAccount: "क्या आपके पास पहले से खाता है?",
      loginHere: "यहाँ लॉग इन करें",
      error: {
        nameRequired: "पूरा नाम आवश्यक है।",
        phoneLength: "फ़ोन नंबर ठीक 10 अंकों का होना चाहिए।",
        passwordLength: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
        passwordMatch: "पासवर्ड मेल नहीं खाते।",
        generic: "पंजीकरण विफल। कृपया पुनः प्रयास करें।",
        success: "पंजीकरण सफल! लॉग इन के लिए रीडायरेक्ट किया जा रहा है..."
      }
    },
    events: {
      allEvents: "सभी कार्यक्रम",
      calendar: "कैलेंडर",
      searchPlaceholder: "कार्यक्रम खोजें...",
      nextEvent: "अगला कार्यक्रम",
      upcomingEvents: "आगामी कार्यक्रम",
      ongoingEvents: "चल रहे कार्यक्रम",
      finishedEvents: "संपन्न कार्यक्रम",
      loading: "कार्यक्रम लोड हो रहे हैं...",
      error: "कार्यक्रम लोड करने में विफल। कृपया बाद में पुनः प्रयास करें।",
      bookingDates: "बुकिंग तिथियाँ",
      eventInProgress: "कार्यक्रम प्रगति पर है",
      eventsOn: "के कार्यक्रम",
      bookingOpenFor: "के लिए बुकिंग खुली है",
      inProgress: "प्रगति पर है",
      noEvents: "कोई आगामी कार्यक्रम नहीं मिला।",
      // Event Card
      card: {
        location: "स्थान",
        dates: "तारीखें",
        bookingWindow: "बुकिंग विंडो",
        liveLinks: "लाइव स्ट्रीम लिंक",
        requestBooking: "बुकिंग अनुरोध",
        bookingClosed: "बुकिंग बंद",
        bookingNotStarted: "बुकिंग अभी शुरू नहीं हुई है"
      }
    },
    // Booking Form
    booking: {
      title: "आवास के लिए अनुरोध",
      editTitle: "अपनी बुकिंग संपादित करें",
      submittedTitle: "बुकिंग सबमिट की गई!",
      submittedDesc: "आपका आवास अनुरोध सफलतापूर्वक सबमिट कर दिया गया है। स्थिति अपडेट के लिए कृपया **मेरी बुकिंग** अनुभाग देखें।",
      goToCalendar: "कैलेंडर पर जाएं",
      submitSuccess: "बुकिंग अनुरोध सफलतापूर्वक सबमिट किया गया!",
      submitError: "बुकिंग अनुरोध सबमिट करने में विफल।",
      updateButton: "बुकिंग अपडेट करें",
      submitButton: "अनुरोध सबमिट करें",
      submitting: "सबमिट हो रहा है...",
      sections: {
        stay: "रुकने की अवधि",
        ashram: "आश्रम और संदर्भ विवरण",
        personal: "आपका विवरण",
        group: "समूह विवरण",
        additional: "अतिरिक्त जानकारी"
      },
      fields: {
        from: "से",
        to: "तक",
        ashramName: "आश्रम का नाम",
        baijiName: "बाईजी / महात्मा जी का नाम",
        baijiContact: "बाईजी / महात्मा जी का संपर्क",
        email: "ईमेल (वैकल्पिक)",
        contact: "संपर्क नंबर",
        address: "पता",
        city: "शहर",
        fillingForOthers: "क्या आप यह फॉर्म दूसरों के लिए भर रहे हैं?",
        memberDetails: "सदस्य विवरण",
        males: "पुरुष",
        females: "महिलाएं",
        boys: "लड़के",
        girls: "लड़कियां",
        name: "नाम",
        age: "उम्र",
        notes: "विशेष अनुरोध / नोट्स"
      },
      notices: {
        stayFrom: "कृपया ध्यान दें: आप कार्यक्रम शुरू होने से 5 दिन पहले से रुकने का विकल्प चुन सकते हैं।",
        stayTo: "कृपया ध्यान दें: आप कार्यक्रम समाप्त होने के 5 दिन बाद तक रुकने का विकल्प चुन सकते हैं।",
        yes: "हाँ",
        no: "नहीं"
      },
      errors: {
        loadingEvent: "लोड हो रहा है...",
        eventNotFound: "कार्यक्रम नहीं मिला। कृपया बाद में पुनः प्रयास करें।",
        addPerson: "आपको कम से कम एक व्यक्ति को जोड़ना होगा।",
        ageLimit: "{name} ({gender}) की उम्र 16 से अधिक है।",
        baijiRequired: "बाईजी / महात्मा जी का नाम और संपर्क अनिवार्य है।",
        contactLength: "कृपया एक मान्य 10-अंकीय संपर्क नंबर दर्ज करें।",
        baijiContactLength: "कृपया एक मान्य 10-अंकीय बाईजी / महात्मा जी संपर्क नंबर दर्ज करें।",
        dateOrder: "'से' तिथि 'तक' तिथि के बाद नहीं हो सकती।"
      },
      genders: {
        male: "पुरुष",
        female: "महिला",
        boy: "लड़का",
        girl: "लड़की"
      }
    },
    // Comments Page
    comments: {
      title: "टिप्पणियाँ और समीक्षाएं",
      leaveReview: "समीक्षा लिखें",
      placeholder: "अपना अनुभव साझा करें...",
      submit: "समीक्षा जमा करें",
      submitting: "जमा हो रहा है...",
      loginPrompt: "कृपया",
      loginLink: "लॉग इन करें",
      loginSuffix: "टिप्पणी या समीक्षा छोड़ने के लिए।",
      noComments: "अभी तक कोई टिप्पणी नहीं। समीक्षा छोड़ने वाले पहले व्यक्ति बनें!",
      anonymous: "अनाम",
      deleteTitle: "हटाने की पुष्टि करें",
      deleteMessage: "क्या आप वाकई इस टिप्पणी को स्थायी रूप से हटाना चाहते हैं?",
      deleteButton: "हटाएं",
      error: {
        empty: "टिप्पणी खाली नहीं हो सकती।",
        submitSuccess: "आपकी टिप्पणी समीक्षा के लिए जमा कर दी गई है!",
        submitFail: "टिप्पणी जमा करने में विफल।",
        fetchFail: "टिप्पणियाँ लाने में विफल।",
        deleteSuccess: "आपकी टिप्पणी हटा दी गई है।",
        deleteFail: "टिप्पणी हटाने में विफल।"
      }
    },
    // My Bookings Page
    myBookings: {
      title: "मेरी बुकिंग",
      searchPlaceholder: "बुकिंग नंबर या कार्यक्रम द्वारा खोजें...",
      noBookings: {
        title: "कोई बुकिंग नहीं मिली",
        desc: "आपने अभी तक कोई बुकिंग नहीं की है। कार्यक्रमों का अन्वेषण करें और अपनी पहली बुकिंग करें!",
        button: "कार्यक्रम ब्राउज़ करें"
      },
      noMatch: "आपकी खोज से कोई बुकिंग मेल नहीं खाती।",
      status: {
        approved: "स्वीकृत",
        pending: "लंबित",
        declined: "अस्वीकृत"
      },
      card: {
        details: "कार्यक्रम विवरण",
        requested: "अनुरोधित:",
        allocation: "आवंटन विवरण:",
        room: "कमरा",
        bed: "बिस्तर",
        downloadPass: "पास डाउनलोड करें",
        edit: "संपादित करें",
        withdraw: "वापस लें",
        declinedMsg: "बुकिंग अस्वीकृत कर दी गई।",
        pendingMsg: "बुकिंग स्वीकृति लंबित है।"
      },
      actions: {
        withdrawConfirm: "क्या आप वाकई इस बुकिंग को वापस लेना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।",
        withdrawSuccess: "बुकिंग सफलतापूर्वक वापस ले ली गई।",
        withdrawFail: "बुकिंग वापस लेने में विफल।",
        updateSuccess: "बुकिंग अपडेट हो गई है और अब पुनः अनुमोदन लंबित है।",
        fetchFail: "बुकिंग लाने में विफल।"
      }
    },
    // Notifications Page
    notifications: {
      title: "मेरी सूचनाएं",
      markAll: "सभी को पढ़ा हुआ चिह्नित करें",
      marking: "चिह्नित किया जा रहा है...",
      markingAll: "सभी को चिह्नित किया जा रहा है...",
      loading: "सूचनाएं लोड हो रही हैं...",
      fetchFail: "सूचनाएं लाने में विफल।",
      noNotifications: "कोई सूचना नहीं।",
      markAsRead: "पढ़ा हुआ चिह्नित करें",
      received: "प्राप्त हुआ"
    },
    // Profile Page
    profile: {
      title: "मेरा प्रोफाइल",
      desc: "अपनी व्यक्तिगत जानकारी और पासवर्ड प्रबंधित करें।",
      updateForm: {
        name: "नाम",
        phone: "फ़ोन नंबर",
        phoneNotice: "फ़ोन नंबर नहीं बदला जा सकता।",
        button: "विवरण अपडेट करें",
        updating: "अपडेट हो रहा है...",
        success: "प्रोफाइल सफलतापूर्वक अपडेट हो गया!",
        error: "प्रोफाइल अपडेट विफल। कृपया पुनः प्रयास करें।",
        email: "ईमेल",
        verified: "सत्यापित",
        unverified: "असत्यापित",
        editEmail: "ईमेल बदलें",
        verifyEmail: "ईमेल सत्यापित करें",
        resendOtp: "OTP फिर से भेजें",
        enterOtp: "OTP दर्ज करें",
        checkEmailCode: "कोड के लिए अपना ईमेल जांचें।",
        verifyAndUpdate: "कोड सत्यापित करें और विवरण अपडेट करें"
      },
      passwordForm: {
        title: "पासवर्ड बदलें",
        current: "वर्तमान पासवर्ड",
        currentPlaceholder: "अपना वर्तमान पासवर्ड दर्ज करें",
        new: "नया पासवर्ड",
        newPlaceholder: "न्यूनतम 6 अक्षर",
        confirm: "नये पासवर्ड की पुष्टि करें",
        confirmPlaceholder: "नया पासवर्ड पुनः दर्ज करें",
        button: "पासवर्ड अपडेट करें",
        updating: "अपडेट हो रहा है...",
        success: "पासवर्ड सफलतापूर्वक बदला गया!",
        error: "पासवर्ड बदलने में विफल।",
        lengthError: "नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।",
        matchError: "नए पासवर्ड मेल नहीं खाते।"
      }
    }
  }
};
