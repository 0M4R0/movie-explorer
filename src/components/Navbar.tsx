import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { SearchBar } from "./navbar-elements/SearchBar";
import type { Movie } from "../types/Movie";
import "../styles/navbar.css";
import popcorn from "../assets/popcorn.png";

interface NavbarProps {
  onSearchResults?: (results: Movie[]) => void;
  onReset?: () => void;
}

export function Navbar({ onSearchResults, onReset }: NavbarProps) {
  const [resetCount, setResetCount] = useState(0);
  const [isBubble, setIsBubble] = useState(false);
  const navbarContentRef = useRef<HTMLDivElement>(null);
  const scrollThreshold = 50; 

  const handleResetClick = () => {
    if (onReset) onReset();
    setResetCount((c) => c + 1);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsBubble(scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (navbarContentRef.current) {
      navbarContentRef.current.classList.toggle("bubble-mode", isBubble);
    }
  }, [isBubble]);

  return (
    <nav className="navbar">
      <div className="navbar-content" ref={navbarContentRef}>
        <div className="navbar-left">
          <Link to="/" onClick={handleResetClick} className="navbar-title link">
            <h1 className="navbar-title">
              <img src={popcorn} alt="Movie Explorer Logo" className="navbar-logo" />
              <span> Movie Explorer</span>
            </h1>
          </Link>
        </div>

        <div className="navbar-right">
          <SearchBar resetKey={resetCount} onResults={(results) => onSearchResults && onSearchResults(results)} />
        </div>
      </div>
    </nav>
  );
}