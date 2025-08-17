import React from 'react';
import { FaYoutube, FaTwitter } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="w-full p-4 border-b bg-gray-100 flex justify-center gap-6 text-sm">
      <a
        href="https://www.youtube.com/@kingcoldsports"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-red-600 hover:underline"
      >
        <FaYoutube />
        YouTube
      </a>
      <a
        href="https://x.com/kingcoldsports"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-blue-500 hover:underline"
      >
        <FaTwitter />
        Twitter
      </a>
    </header>
  );
};

export default Header;
