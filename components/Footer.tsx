import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t border-border mt-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold text-cyan-400">AI Letter Generator</h3>
            <p className="mt-2 text-sm text-text-secondary">Your personal AI-powered advisor for crafting professional job and university application letters.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            <div>
              <h4 className="text-sm font-semibold text-text-primary tracking-wider uppercase">Quick Links</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="/" className="text-text-secondary hover:text-cyan-400 text-sm transition-colors">Home</a></li>
                <li><a href="/dashboard" className="text-text-secondary hover:text-cyan-400 text-sm transition-colors">Generator</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-text-primary tracking-wider uppercase">Legal</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="/about" className="text-text-secondary hover:text-cyan-400 text-sm transition-colors">About Us</a></li>
                <li><a href="/privacy" className="text-text-secondary hover:text-cyan-400 text-sm transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="text-text-secondary hover:text-cyan-400 text-sm transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-border pt-8 text-center text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} AI Letter Generator. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;