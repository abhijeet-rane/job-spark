
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Moon, Sun } from "lucide-react";

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar = ({ isDarkMode, toggleDarkMode }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-jobspark-primary">Job</span>
              <span className="text-2xl font-bold text-jobspark-accent">Spark</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/features" className="text-foreground hover:text-jobspark-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Features
            </Link>
            <Link to="/pricing" className="text-foreground hover:text-jobspark-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-foreground hover:text-jobspark-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">
              About
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="ml-2">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link to="/auth">
              <Button variant="outline" className="ml-2">Log In</Button>
            </Link>
            <Link to="/auth?register=true">
              <Button className="bg-jobspark-primary hover:bg-opacity-90">Register</Button>
            </Link>
          </div>
          
          <div className="flex md:hidden items-center">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="mr-2">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-b border-border">
            <Link 
              to="/features" 
              className="text-foreground hover:text-jobspark-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="text-foreground hover:text-jobspark-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className="text-foreground hover:text-jobspark-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/auth" 
              className="text-foreground hover:text-jobspark-primary block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Log In
            </Link>
            <Link 
              to="/auth?register=true" 
              className="bg-jobspark-primary text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
