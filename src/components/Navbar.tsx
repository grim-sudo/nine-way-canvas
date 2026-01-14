import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/9waymedia-logo.png";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);

  // track whether page is scrolled for visual tweaks
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // compute active section on scroll using visible area (rAF for performance)
  useEffect(() => {
    const sectionIds = ["home", "about", "vision", "services", "why-choose-us", "founders", "contact"];
    let ticking = false;

    const computeActive = () => {
      ticking = false;
      let bestId: string | null = null;
      let maxVisible = 0;
      const viewportTop = 0;
      const viewportBottom = window.innerHeight;

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.bottom, viewportBottom) - Math.max(rect.top, viewportTop));
        if (visible > maxVisible) {
          maxVisible = visible;
          bestId = id;
        }
      });

      if (bestId) setActiveSection(bestId);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(computeActive);
      }
    };

    // compute once and add listeners
    computeActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // ensure sections have enough top margin for scroll snapping / anchors
  useEffect(() => {
    const sectionIds = ["home", "about", "vision", "services", "why-choose-us", "founders", "contact"];
    const navHeight = navRef.current ? Math.ceil(navRef.current.getBoundingClientRect().height) : 64;
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        // add a small extra offset so the section content isn't hidden under the navbar
        (el as HTMLElement).style.scrollMarginTop = `${navHeight + 8}px`;
      }
    });
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsOpen(false);
      // immediately mark as active to avoid observer briefly highlighting nearby section
      setActiveSection(sectionId);
    }
  };

  const menuItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "vision", label: "Vision" },
    { id: "services", label: "Services" },
    { id: "founders", label: "Founders" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <nav
      ref={(el) => (navRef.current = el)}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-600 bg-black text-white shadow-2xl border-b border-black dark:bg-background/80 dark:backdrop-blur-xl dark:shadow-2xl dark:border-b dark:border-border/50 ${
        isScrolled ? "" : ""
      }`}
    >
      <div className="container mx-auto px-6 py-2">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => scrollToSection("home")}
          >
            <img
              src={logo}
              alt="9waymedia Solutions"
              className="h-10 sm:h-12 w-auto"
            />
            <div className="flex flex-col">
              <h1 className="text-sm md:text-base lg:text-lg font-bold leading-tight tracking-wide whitespace-nowrap">
                9 Way Media Solutions
              </h1>
              <p className="text-[8px] md:text-[9px] lg:text-[11px] font-medium text-center tracking-wide whitespace-nowrap">
                AI Based Digital Marketing Agency
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-semibold tracking-wide transition-all duration-300 relative group ${
                    activeSection === item.id
                      ? "dark:text-primary text-white"
                      : "dark:text-foreground/80 dark:hover:text-primary text-white hover:text-gray-300"
                  }`}
                >
                  {item.label}
                  <span 
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300 ${
                      activeSection === item.id ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </button>
              ))}
            </div>
            <ThemeToggle />
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-6 w-6 text-white dark:text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-6 mt-8">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`text-lg font-semibold tracking-wide transition-all duration-300 text-left ${
                        activeSection === item.id
                          ? "dark:text-primary text-primary"
                          : "dark:text-foreground/80 dark:hover:text-primary text-foreground hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
