const Hero = () => {
  const integrationLogos = [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/512px-Gmail_icon_%282020%29.svg.png",
      alt: "Gmail",
      className: "w-12 h-12"
    },
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2560px-Microsoft_logo.svg.png",
      alt: "Microsoft",
      className: "w-12 h-12"
    },
    {
      src: "https://a.slack-edge.com/80588/marketing/img/meta/slack_hash_256.png",
      alt: "Slack",
      className: "w-12 h-12"
    }
  ];

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 pt-24 pb-12 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Note sticky note - LEFT SIDE (lines only) */}
        <div className="absolute left-8 top-1/3 w-48 h-40 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl shadow-2xl p-6 transform rotate-6 hover:rotate-3 transition-all duration-500 border border-yellow-200 z-20">
          <div className="space-y-2">
            <div className="w-20 h-3 bg-yellow-300 rounded-full"></div>
            <div className="w-16 h-2 bg-yellow-400 rounded-full"></div>
            <div className="w-24 h-2 bg-yellow-400 rounded-full"></div>
            <div className="w-20 h-2 bg-yellow-400 rounded-full"></div>
          </div>
        </div>

        {/* Check icon sticky note - LEFT BOTTOM */}
        <div className="absolute left-24 bottom-1/4 w-32 h-28 bg-white rounded-2xl shadow-2xl p-4 transform -rotate-3 hover:rotate-0 transition-all duration-500 border border-gray-200 flex items-center justify-center z-20">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Today Tasks - RIGHT BOTTOM */}
        <div className="absolute right-12 bottom-20 w-64 h-48 bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 transform hover:scale-105 transition-all duration-500 z-20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900">Today's Tasks</h4>
            <div className="w-3 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-lg"></div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Design landing page</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Review PRs</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-700 font-medium">Deploy to prod</span>
            </div>
          </div>
        </div>

        {/* Reminder - RIGHT TOP */}
        <div className="absolute right-8 top-1/4 w-52 h-44 bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 transform rotate-12 hover:rotate-9 transition-all duration-500 z-20 overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-10 bg-gradient-to-b from-orange-400 to-orange-500 rounded-lg"></div>
            <h4 className="text-lg font-bold text-gray-900">Reminders</h4>
          </div>
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-2xl mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm text-gray-900 truncate">Team meeting</p>
              <p className="text-xs text-gray-500">2:30 PM</p>
            </div>
          </div>
        </div>

        {/* Meeting timer - CENTER RIGHT */}
        <div className="absolute right-32 top-1/2 w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-white font-bold transform -rotate-6 hover:rotate-0 transition-all duration-500 z-10">
          <span className="text-2xl">01:23</span>
          <span className="text-xs uppercase tracking-wide">Meeting</span>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-30 w-full max-w-6xl mx-auto px-6 lg:px-8 text-center">
        <h1 className="font-black text-gray-900 mb-10 leading-none">
            {/* First line */}
            <span className="block text-6xl sm:text-7xl lg:text-8xl leading-none">
                Stay organized and
            </span>

            {/* Second line with anti-clip wrapper */}
            <div className="overflow-visible py-2">
                <span className="inline-block text-5xl sm:text-6xl lg:text-7xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent md:whitespace-nowrap leading-[1.25] pb-3 [-webkit-text-stroke:1px_transparent]">
                boost your productivity
                </span>
            </div>
        </h1>


        {/* Third line (subline) */}
        <p className="text-2xl sm:text-3xl lg:text-4xl text-gray-600 mb-32 max-w-4xl mx-auto leading-relaxed font-light">
            Efficiently manage your tasks and boost productivity.
        </p>
        
        {/* Blue dot pattern - BELOW TEXT */}
        <div className="mb-12 opacity-80 pointer-events-none z-10">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-2xl mx-auto relative">
            <div className="w-8 h-8 bg-white rounded-full shadow-lg absolute -top-2 left-2"></div>
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg absolute top-2 right-2"></div>
          </div>
        </div>
        
        {/* Logos - ALL SAME HEIGHT w-12 h-12 (Teams removed) */}
        <div className="flex justify-center items-center gap-8 opacity-70 mb-8 z-20 relative">
          {integrationLogos.map((logo, index) => (
            <img 
              key={index}
              src={logo.src}
              alt={logo.alt}
              className={`${logo.className} hover:opacity-100 hover:scale-110 transition-all duration-300 drop-shadow-lg object-contain`}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
