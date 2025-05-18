'use client';

import React, { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY_WAITLIST_IFRAME_CLOSED = 'hasClosedWaitlistPopupBeehiiv';

export default function WaitlistPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasClosed = localStorage.getItem(LOCAL_STORAGE_KEY_WAITLIST_IFRAME_CLOSED);
    if (!hasClosed) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(LOCAL_STORAGE_KEY_WAITLIST_IFRAME_CLOSED, 'true');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 backdrop-blur-lg flex items-center justify-center z-[1000] p-4 transition-opacity duration-300 ease-in-out">
      <div className="glassmorphic-popup-card transform transition-all duration-300 ease-in-out scale-100">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-white text-opacity-70 hover:text-opacity-100 text-3xl leading-none hover:bg-white hover:bg-opacity-10 rounded-full p-1 z-10 transition-colors"
          aria-label="Close popup"
        >
          &times;
        </button>

        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold mb-2 font-cabin text-gradient-white-to-custom">
            Join our Early Access list!
          </h2>
          <p className="mt-1 text-lg font-cabin text-gradient-white-to-custom">
            Be the first to know about the launch, straight to your inbox.
          </p>
        </div>

        <div className="aspect-[600/300] w-full max-w-[600px] mx-auto rounded-[15px] overflow-hidden border border-transparent hover:border-[rgba(255,255,255,0.18)] transition-colors duration-200 flex items-center justify-center">
          <iframe
            src="https://embeds.beehiiv.com/4ab9ced1-0bf9-41a0-958f-61504fe922b5"
            data-test-id="beehiiv-embed"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            style={{ borderRadius: '15px', border: 'none', margin: '0', backgroundColor: 'transparent' }}
          ></iframe>
        </div>
      </div>
    </div>
  );
}
