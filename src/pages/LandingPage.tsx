import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [hoverCard, setHoverCard] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if the device is mobile based on screen width
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const features = [
    {
      title: "Secure Banking",
      description:
        "Follow most up-to-date security protocols to keep your finances safe",
      borderClass: "border-pink-400", // explicit class instead of dynamic color string
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      title: "24/7 Support",
      description: "Our customer service team is available around the clock",
      borderClass: "border-green-400",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
          />
        </svg>
      ),
    },
    {
      title: "Mobile Banking",
      description: "Access your accounts anytime, anywhere with our web app",
      borderClass: "border-sky-400",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-violet-800 to-violet-700 flex flex-col p-6 text-white relative">
      {/* Navigation bar - fixed position for mobile, absolute for desktop */}
      <div className={`${isMobile ? 'fixed z-10 top-0 left-0 right-0 bg-violet-900/80 backdrop-blur-sm p-4' : 'absolute top-0 right-0 p-6'} flex ${isMobile ? 'justify-center' : 'gap-4'}`}>
        <Link to="/login" className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-md hover:bg-white/15 hover:font-semibold transition-all mx-2">
          Login
        </Link>
        <Link to="/signup" className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-md hover:bg-white/15 hover:font-semibold transition-all mx-2">
          Sign Up
        </Link>
      </div>

      <div className={`flex-grow flex flex-col items-center justify-center ${isMobile ? 'mt-20' : ''}`}>
        <div className="max-w-3xl text-center mb-16">
          <div className="mb-6">
            <img
              src="/money.png"
              alt="Money Icon"
              className={`${isMobile ? 'h-24' : 'h-32'} w-auto mx-auto filter drop-shadow-lg`}
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to{" "}
            <span
              className="relative"
              style={{
                textShadow: `0 0 8px rgba(255, 255, 255, 0.8)`,
                transition: "none",
              }}
            >
              Aurora
            </span>{" "}
            <br /> Banking App
          </h1>

          <p className="text-xl md:text-2xl mb-8">
            Secure, fast, and reliable banking services for everyone
          </p>
          <Link
            to="/signup"
            className="text-white/80 hover:text-white-500 hover:font-semibold underline transition-all text-lg"
          >
            Not a customer? Sign up here
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white/5 backdrop-blur-sm p-6 rounded-lg transition-all duration-300 border-2 ${
                hoverCard === index ? feature.borderClass : "border-transparent"
              }`}
              onMouseEnter={() => setHoverCard(index)}
              onMouseLeave={() => setHoverCard(null)}
            >
              <div className="flex flex-col items-center text-center">
                {feature.icon}
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-white/70 text-lg">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
