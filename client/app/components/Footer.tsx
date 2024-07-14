import React from "react";

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white w-full  opacity-70">
      <div className="py-6 px-4 bg-neutral-900 w-full">
        <p className="text-center text-gray-400 text-base">
          &copy; {new Date().getFullYear()} solmetrics. Made by{" "}
          <a href="www.x.com/duckwhocodes">@dakshi</a>.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
