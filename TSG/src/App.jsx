import React, { useState, useEffect, useRef } from "react";
import portfolioData from "./assets/data.json";

/* ==========================================================================
   HELPERS & UTILITIES
   ========================================================================== */

const calculateAge = (dobString) => {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

/* ==========================================================================
   SHARED UI COMPONENTS
   ========================================================================== */

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="group flex items-center gap-3 text-neutral-500 hover:text-[#00E5FF] font-black uppercase tracking-[0.2em] text-xs transition-colors mb-12"
  >
    <span className="text-[#00E5FF] group-hover:-translate-x-2 transition-transform">
      &lt;
    </span>
    Return to Main
  </button>
);

// --- NEW COMPONENT: MINI BROWSER ---
const MiniBrowser = ({ url }) => {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  // Calculates the scale multiplier to force 1280px into the current container width
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setScale(containerWidth / 1280);
      }
    };

    updateScale(); // Initial scale
    window.addEventListener("resize", updateScale); // Update on screen resize
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div className="w-full rounded-xl overflow-hidden border border-white/20 shadow-[0_0_40px_rgba(0,229,255,0.15)] bg-[#0b0b0b] mt-8 group">
      {/* Fake Browser Header */}
      <div className="bg-[#151515] px-4 py-3 flex items-center gap-4 border-b border-white/5 relative">
        {/* Window Controls */}
        <div className="flex gap-2 shrink-0">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>

        {/* Address Bar */}
        <div className="mx-auto bg-black border border-white/5 rounded-md px-4 py-1.5 flex items-center max-w-lg w-full shadow-inner">
          <span className="text-[#00E5FF] mr-2 text-[10px]">🔒</span>
          <span className="text-[10px] text-neutral-400 font-mono truncate tracking-widest">
            {url}
          </span>
        </div>
      </div>

      {/* Scaled Viewport Container (16:9 Aspect Ratio Lock) */}
      <div
        ref={containerRef}
        className="w-full relative overflow-hidden bg-neutral-900"
        style={{ paddingTop: "56.25%" }}
      >
        <iframe
          src={url}
          className="absolute top-0 left-0 origin-top-left transition-opacity duration-1000"
          style={{
            width: "1280px",
            height: "720px",
            transform: `scale(${scale})`,
            border: "none",
          }}
          title="Live Project Browser"
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

/* ==========================================================================
   VIEW 1: MAIN SUMMARY
   ========================================================================== */

const MainView = ({ data, setView, setActiveProject }) => {
  const [randomProjects, setRandomProjects] = useState([]);

  // --- DIRECT COMM STATE ---
  const [commMessage, setCommMessage] = useState("");
  const [commStatus, setCommStatus] = useState("IDLE");

  useEffect(() => {
    const shuffled = [...data.projects].sort(() => 0.5 - Math.random());
    setRandomProjects(shuffled.slice(0, 3));
  }, [data.projects]);

  // --- TRANSMISSION HANDLER (FRONTEND AI INTERCEPTOR) ---
  const handleTransmission = async (e) => {
    e.preventDefault();

    if (commMessage.trim().length < 10) {
      setCommStatus("REJECTED");
      return;
    }

    setCommStatus("ANALYZING");

    try {
      const response = await fetch(
        "https://hook.us2.make.com/iyrtfi12ochyy8d1ljnom7xpy2ylqhyz",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: commMessage }),
        }
      );

      if (response.ok) {
        setCommStatus("SENT");
        setCommMessage("");
      } else {
        setCommStatus("ERROR");
      }
    } catch (error) {
      setCommStatus("ERROR");
    }
  };

  return (
    <div className="space-y-40">
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between gap-16 min-h-[60vh]">
        <div className="w-full lg:w-3/5 space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 border border-[#00E5FF]/30 bg-[#00E5FF]/5 font-bold tracking-[0.1em] text-xs text-[#00E5FF] uppercase shadow-[0_0_15px_rgba(0,229,255,0.1)]">
            <span className="w-2 h-2 bg-[#00E5FF] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,229,255,1)]"></span>
            System Status: Online
          </div>

          <div className="border-l-4 border-[#FF00FF] pl-6 py-2">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-[0.2em] mb-2">
              {data.profile.alias}
            </h2>
            <h3 className="text-[#00E5FF] font-bold tracking-[0.2em] uppercase text-xs">
              ID: {data.profile.name}
            </h3>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tight leading-[1.1]">
            {data.profile.title.split(".")[0]}. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#FF00FF] drop-shadow-[0_0_20px_rgba(255,0,255,0.3)]">
              {data.profile.title.split(".")[1]}.
            </span>
          </h1>

          <p className="text-lg leading-relaxed max-w-xl text-neutral-400 font-medium">
            {data.profile.shortInfo}
          </p>
        </div>

        <div className="w-full lg:w-2/5 flex justify-center lg:justify-end relative">
          <div className="relative w-full max-w-sm border border-white/10 bg-gradient-to-t from-black to-neutral-900 flex flex-col group overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.1)] hover:shadow-[0_0_40px_rgba(0,229,255,0.3)] hover:border-[#00E5FF]/50 transition-all duration-700">
            {data.profile.avatarUrl ? (
              <img
                src={data.profile.avatarUrl}
                alt="Profile"
                className="w-full h-auto min-h-[350px] object-cover object-bottom transition-all duration-700 opacity-90 drop-shadow-[0_0_15px_rgba(0,229,255,0.4)] group-hover:drop-shadow-[0_0_30px_rgba(255,0,255,0.8)] group-hover:opacity-100 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full min-h-[400px] flex items-center justify-center text-neutral-800 text-6xl font-black uppercase tracking-widest z-0">
                {data.profile.avatarText}
              </div>
            )}

            <div className="relative z-10 w-full p-6 bg-black shadow-[0_-25px_25px_rgba(0,0,0,0.8)] border-t border-[#00E5FF]/30 flex justify-between text-xs font-bold uppercase tracking-[0.15em] text-white pointer-events-none mt-auto">
              <span>Auth Level</span>
              <span className="text-[#00E5FF]">SysAdmin</span>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-12">
        <div className="border-b border-white/10 pb-6 flex justify-between items-end">
          <h2 className="text-3xl font-black text-white uppercase tracking-[0.1em]">
            System Highlights
          </h2>
          <button
            onClick={() => setView("PROJECTS")}
            className="text-[#00E5FF] hover:text-white text-xs font-bold uppercase tracking-widest transition-colors hidden sm:block"
          >
            View All History →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {randomProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => proj.isClickable && setActiveProject(proj)}
              className={`bg-neutral-950 border border-white/10 p-8 flex flex-col h-full ${proj.isClickable ? "cursor-pointer hover:border-[#00E5FF]/60 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)] transition-all group" : ""}`}
            >
              {proj.thumbnailUrl ? (
                <img
                  src={proj.thumbnailUrl}
                  alt={proj.title}
                  className="w-full h-48 bg-black object-contain border border-white/5 mb-6 opacity-70 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-full h-48 bg-black border border-white/5 flex flex-col items-center justify-center text-neutral-800 font-black tracking-widest uppercase text-xs mb-6">
                  <span className="text-[#00E5FF] mb-2">▼</span>[ VISUAL DATA
                  UNAVAILABLE ]
                </div>
              )}
              <h3
                className={`text-xl font-black text-white uppercase tracking-wide mb-4 ${proj.isClickable ? "group-hover:text-[#00E5FF]" : ""}`}
              >
                {proj.title}
              </h3>
              <p className="text-neutral-400 text-sm flex-grow mb-6">
                {proj.overview}
              </p>
              {proj.isClickable && (
                <span className="text-[#00E5FF] text-[10px] uppercase font-bold tracking-widest block border-t border-white/5 pt-4">
                  [ DECRYPT FULL RECORD ]
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --- DIRECT COMM LINK SECTION --- */}
      <section className="bg-neutral-950 border border-white/10 p-8 md:p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF00FF] filter blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
        <h2 className="text-3xl font-black text-white uppercase tracking-[0.1em] mb-4">
          Direct Comm Link
        </h2>

        <p className="text-[#FF00FF] text-xs font-bold uppercase tracking-widest mb-4">
          Automated AI filtering active. Spam, bashing, and bots will be
          discarded.
        </p>

        <p className="text-[#00E5FF] text-[10px] font-bold uppercase tracking-widest mb-8 border-l-2 border-[#00E5FF] pl-3 py-1 bg-[#00E5FF]/5">
          [ SYSTEM ADVISORY: Include your preferred return vector (Viber,
          Telegram, or Email) so I can initiate a callback. ]
        </p>

        <form onSubmit={handleTransmission}>
          <textarea
            value={commMessage}
            onChange={(e) => {
              setCommMessage(e.target.value);
              setCommStatus("IDLE");
            }}
            placeholder="Transmit message directly to my inbox..."
            className={`w-full bg-black border p-6 text-white text-sm focus:outline-none transition-colors mb-6 shadow-inner ${
              commStatus === "REJECTED"
                ? "border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.2)]"
                : "border-white/20 focus:border-[#FF00FF]"
            }`}
            rows="5"
            disabled={commStatus === "ANALYZING" || commStatus === "SENT"}
            required
          ></textarea>

          <button
            type="submit"
            disabled={commStatus === "ANALYZING" || commStatus === "SENT"}
            className={`w-full md:w-auto px-10 py-5 border-2 font-black uppercase tracking-[0.15em] text-sm transition-all ${
              commStatus === "ANALYZING"
                ? "border-[#00E5FF] text-[#00E5FF] animate-pulse"
                : commStatus === "SENT"
                  ? "border-green-500 text-green-500"
                  : commStatus === "REJECTED"
                    ? "border-red-500 text-red-500"
                    : "border-white text-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
            }`}
          >
            {commStatus === "ANALYZING"
              ? "[ ANALYZING... ]"
              : commStatus === "SENT"
                ? "[ LOGGED ]"
                : commStatus === "REJECTED"
                  ? "[ BLOCKED ]"
                  : commStatus === "ERROR"
                    ? "[ ERROR: RETRY ]"
                    : "Execute Transmission"}
          </button>
        </form>
      </section>
    </div>
  );
};

/* ==========================================================================
   VIEW 2: ABOUT
   ========================================================================== */

const AboutView = ({ data }) => (
  <div className="space-y-16 animate-fade-in max-w-5xl mx-auto">
    <div className="border-b border-white/10 pb-6">
      <h2 className="text-4xl font-black text-white uppercase tracking-[0.1em]">
        Identity & Origin
      </h2>
    </div>

    <div className="w-full h-96 bg-neutral-950 border border-white/10 flex items-center justify-center text-neutral-800 font-black text-4xl uppercase tracking-widest overflow-hidden relative group">
      {data.profile.avatarUrl ? (
        <img
          src={data.profile.coverPhoto}
          alt="Origin"
          className="absolute inset-0 w-full object-contain object-bottom opacity-90 transition-all duration-700 drop-shadow-[0_0_15px_rgba(0,229,255,0.4)] group-hover:drop-shadow-[0_0_30px_rgba(255,0,255,0.8)] group-hover:opacity-100 group-hover:scale-[1.03]"
        />
      ) : (
        data.profile.avatarText
      )}
    </div>

    <div className="text-neutral-300 leading-loose text-base whitespace-pre-wrap font-medium">
      {data.profile.fullStory}
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-white/10">
      {Object.entries(data.profile.stats).map(([key, value]) => {
        let displayKey = key;
        let displayValue = value;

        if (key === "DOB") {
          displayKey = "Age";
          displayValue = calculateAge(value);
        }

        return (
          <div
            key={key}
            className="bg-neutral-950 border border-white/5 p-6 hover:border-[#00E5FF]/40 transition-colors"
          >
            <p className="text-[#00E5FF] text-[10px] uppercase font-bold tracking-widest mb-2">
              {displayKey}
            </p>
            <p className="text-white text-sm font-black uppercase tracking-wide">
              {displayValue}
            </p>
          </div>
        );
      })}
    </div>

    {data.profile.originStories && data.profile.originStories.length > 0 && (
      <div className="space-y-16 pt-16 border-t border-white/10">
        <h3 className="text-3xl font-black text-white uppercase tracking-[0.1em] text-center mb-12">
          Life Highlights
        </h3>

        <div className="space-y-12">
          {data.profile.originStories.map((story) => (
            <div
              key={story.id}
              className="bg-neutral-950 border border-white/10 p-8 space-y-6 hover:border-[#FF00FF]/40 transition-colors duration-300 shadow-lg"
            >
              <h4 className="text-2xl font-black text-white uppercase tracking-wide border-l-4 border-[#FF00FF] pl-4">
                {story.title}
              </h4>

              {story.imageUrl ? (
                <img
                  src={story.imageUrl}
                  alt={story.title}
                  className="w-full h-auto max-h-96 object-cover border border-white/5 shadow-[0_0_20px_rgba(255,0,255,0.1)]"
                />
              ) : (
                <div className="w-full h-64 bg-black border border-white/5 flex items-center justify-center text-neutral-800 font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,255,0.1)]">
                  {story.imagePlaceholder}
                </div>
              )}

              <p className="text-neutral-300 leading-relaxed text-sm whitespace-pre-wrap">
                {story.story}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

/* ==========================================================================
   VIEW 3: HISTORY
   ========================================================================== */

const ProjectsView = ({ data, setActiveProject }) => (
  <div className="space-y-32 animate-fade-in max-w-6xl mx-auto">
    <section className="space-y-12">
      <div className="border-b border-white/10 pb-6">
        <h2 className="text-4xl font-black text-white uppercase tracking-[0.1em]">
          Employment Records
        </h2>
      </div>

      <div className="space-y-12 border-l-2 border-[#FF00FF]/30 pl-8 relative ml-4">
        {data.experience.map((exp) => (
          <div
            key={exp.id}
            className="relative bg-neutral-950 border border-white/10 p-8 hover:border-[#FF00FF]/40 transition-colors duration-300 group shadow-lg"
          >
            <div className="absolute -left-[41px] top-0 w-4 h-4 bg-black border-2 border-[#FF00FF] rounded-full shadow-[0_0_15px_rgba(255,0,255,1)]"></div>

            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6 border-b border-white/5 pb-6">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-wide group-hover:text-[#FF00FF] transition-colors">
                  {exp.role}
                </h3>
                <p className="text-[#00E5FF] font-bold tracking-widest text-xs uppercase mt-2">
                  [ {exp.company} ]
                </p>
              </div>
              <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-4 py-2 border border-white/10 whitespace-nowrap">
                {exp.date}
              </span>
            </div>

            <ul className="space-y-4">
              {exp.details.map((detail, idx) => (
                <li
                  key={idx}
                  className="text-neutral-300 text-sm flex gap-4 leading-relaxed font-medium"
                >
                  <span className="text-[#FF00FF] mt-0.5 font-black">▹</span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>

    <section className="space-y-12">
      <div className="border-b border-white/10 pb-6">
        <h2 className="text-4xl font-black text-white uppercase tracking-[0.1em]">
          Project Deployments
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.projects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => proj.isClickable && setActiveProject(proj)}
            className={`bg-neutral-950 border border-white/10 p-8 flex flex-col md:flex-row gap-8 ${proj.isClickable ? "cursor-pointer hover:border-[#00E5FF]/50 hover:shadow-[0_0_20px_rgba(0,229,255,0.15)] transition-all group" : ""}`}
          >
            {proj.thumbnailUrl ? (
              <img
                src={proj.thumbnailUrl}
                alt={proj.title}
                className="w-full md:w-32 h-48 md:h-32 bg-black object-contain border border-white/5 flex-shrink-0"
              />
            ) : (
              <div className="w-full md:w-32 h-48 md:h-32 flex-shrink-0 bg-black border border-white/5 flex items-center justify-center text-neutral-800 font-black tracking-widest uppercase text-[10px] text-center p-2 leading-loose">
                [ MEDIA <br /> REDACTED ]
              </div>
            )}

            <div>
              <h3
                className={`text-xl font-black text-white uppercase tracking-wide mb-2 ${proj.isClickable ? "group-hover:text-[#00E5FF]" : ""}`}
              >
                {proj.title}
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                {proj.overview}
              </p>
              {proj.isClickable && (
                <span className="text-[#00E5FF] text-[10px] uppercase font-bold tracking-widest block border-t border-white/5 pt-4">
                  [ DECRYPT RECORD ]
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  </div>
);

const FullProjectView = ({ project, onBack }) => (
  <div className="max-w-4xl mx-auto">
    <BackButton onClick={onBack} />
    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-[0.1em] mb-12">
      {project.title}
    </h2>
    <div className="space-y-12">
      {project.fullStory.map((block, idx) => {
        // Render Text Block
        if (block.type === "text") {
          return (
            <p
              key={idx}
              className="text-neutral-300 leading-relaxed text-base font-medium p-6 bg-neutral-950 border-l-4 border-[#00E5FF]"
            >
              {block.content}
            </p>
          );
        }

        // Render Image Block
        if (block.type === "image") {
          return block.url ? (
            <img
              key={idx}
              src={block.url}
              alt="Project Asset"
              className="w-full h-auto border border-white/10 shadow-[0_0_30px_rgba(0,229,255,0.1)] object-cover"
            />
          ) : (
            <div
              key={idx}
              className="w-full h-80 bg-black border border-white/10 flex items-center justify-center text-neutral-800 font-black text-2xl uppercase tracking-widest shadow-[0_0_30px_rgba(0,229,255,0.1)]"
            >
              {block.placeholder}
            </div>
          );
        }

        // Render Desktop Web Browser Wrapper Block
        if (block.type === "browser") {
          return <MiniBrowser key={idx} url={block.src} />;
        }

        // Standard Embedded iFrame 
        if (block.type === "iframe") {
          return (
            <div
              key={idx}
              className="w-full flex justify-center bg-black border border-white/10 shadow-[0_0_30px_rgba(0,229,255,0.1)] p-6 md:p-8"
            >
              <iframe
                src={block.src}
                className="w-full aspect-video rounded-md shadow-lg shadow-[#FF00FF]/20"
                style={{ border: "none", overflow: "hidden" }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              ></iframe>
            </div>
          );
        }
        return null;
      })}
    </div>
  </div>
);
/* ==========================================================================
   VIEW 4: BLOG / LOGS (NOW WITH DYNAMIC IMPORT, LAZY LOADING & VIDEO SUPPORT)
   ========================================================================== */

const BlogView = () => {
  const [blogData, setBlogData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(15);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    // This dynamically imports the file ONLY when the user navigates to the BlogView
    import("./assets/blog.json")
      .then((module) => {
        // Supports both { "blog": [...] } format or just [...] array format
        const data = module.default?.blog || module.blog || module.default || module;
        setBlogData(data);
        setIsFetching(false);
      })
      .catch((error) => {
        console.error("Error loading transmission logs:", error);
        setIsFetching(false);
      });
  }, []);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 15);
  };

  if (isFetching) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center pt-32 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin"></div>
        <div className="text-[#00E5FF] font-black uppercase tracking-[0.2em] animate-pulse text-xs text-center">
          [ ESTABLISHING CONNECTION... FETCHING ARCHIVES ]
        </div>
      </div>
    );
  }

  const visiblePosts = blogData.slice(0, visibleCount);
  const hasMore = visibleCount < blogData.length;

  return (
    <div className="max-w-3xl mx-auto space-y-16">
      <div className="border-b border-white/10 pb-6 flex justify-between items-end">
        <h2 className="text-4xl font-black text-white uppercase tracking-[0.1em]">
          Transmission Logs
        </h2>
        <div className="text-[#00E5FF] text-[10px] font-bold uppercase tracking-widest bg-[#00E5FF]/10 px-3 py-1 border border-[#00E5FF]/20 hidden sm:block">
          Total Records: {blogData.length}
        </div>
      </div>
      
      <div className="space-y-16 border-l-2 border-[#00E5FF]/30 pl-8 relative ml-4">
        {visiblePosts.map((post) => (
          <div key={post.id} className="relative animate-fade-in">
            <div className="absolute -left-[41px] top-0 w-4 h-4 bg-black border-2 border-[#00E5FF] rounded-full shadow-[0_0_15px_rgba(0,229,255,1)]"></div>
            <div className="bg-neutral-950 border border-white/10 p-8 hover:border-[#00E5FF]/30 transition-colors shadow-lg">
              <span className="text-[#00E5FF] text-[10px] font-bold uppercase tracking-widest bg-[#00E5FF]/10 px-3 py-1 border border-[#00E5FF]/20">
                {post.date}
              </span>
              <h3 className="text-2xl font-black text-white uppercase tracking-wide mt-6 mb-6">
                {post.title}
              </h3>
              
              {/* IMAGE RENDERER */}
              {post.type === "image" &&
                (post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-auto max-h-96 object-cover border border-white/5 mb-6 opacity-80 hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-64 bg-black border border-white/5 flex items-center justify-center text-neutral-800 font-black text-sm uppercase tracking-widest mb-6 opacity-80 hover:opacity-100 transition-opacity">
                    {post.imagePlaceholder}
                  </div>
                ))}

              {/* NEW: VIDEO / IFRAME RENDERER */}
              {post.type === "iframe" && post.src && (
                <div className="w-full flex justify-center bg-black border border-white/10 shadow-[0_0_30px_rgba(0,229,255,0.1)] p-4 mb-6">
                  <iframe
                    src={post.src}
                    className="w-full aspect-video rounded-md shadow-lg shadow-[#FF00FF]/20"
                    style={{ border: "none", overflow: "hidden" }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  ></iframe>
                </div>
              )}

              {/* TEXT CONTENT RENDERER */}
              {post.content && (
                <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="pt-8 flex justify-center border-t border-white/10">
          <button
            onClick={handleLoadMore}
            className="px-8 py-4 border border-[#00E5FF]/50 text-[#00E5FF] font-black uppercase tracking-[0.15em] text-xs hover:bg-[#00E5FF] hover:text-black transition-all shadow-[0_0_15px_rgba(0,229,255,0.1)] hover:shadow-[0_0_20px_rgba(0,229,255,0.5)]"
          >
            [ Retrieve 15 More ]
          </button>
        </div>
      )}
    </div>
  );
};
/* ==========================================================================
   MASTER CONTROLLER
   ========================================================================== */

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("MAIN");
  const [activeProject, setActiveProject] = useState(null);
  const [activeLegal, setActiveLegal] = useState(null);

  // NEW MOBILE STATE:
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 404 Safeguard
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const path = queryParams.get("p");
    if (path) {
      window.history.replaceState(null, null, path);
    }
  }, []);

  // Simulate Asset Loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentView, activeProject, activeLegal]);

  // Master Navigation Handler
  const handleNavClick = (view) => {
    setCurrentView(view);
    setActiveProject(null);
    setActiveLegal(null);
    setIsMobileMenuOpen(false); // Closes menu when a link is clicked
  };

  const renderView = () => {
    if (activeLegal) {
      return (
        <div className="max-w-4xl mx-auto">
          <BackButton onClick={() => setActiveLegal(null)} />
          <h2 className="text-4xl font-black text-white uppercase tracking-[0.1em] border-b border-white/10 pb-6 mb-12">
            {activeLegal}
          </h2>
          <div className="text-neutral-300 text-sm whitespace-pre-wrap leading-relaxed bg-neutral-950 p-8 border border-white/10">
            {portfolioData.legal[activeLegal]}
          </div>
        </div>
      );
    }
    if (activeProject)
      return (
        <FullProjectView
          project={activeProject}
          onBack={() => setActiveProject(null)}
        />
      );

    switch (currentView) {
      case "ABOUT":
        return <AboutView data={portfolioData} />;
      case "PROJECTS":
        return (
          <ProjectsView
            data={portfolioData}
            setActiveProject={setActiveProject}
          />
        );
      case "BLOG":
        // Notice we removed data={portfolioData} because it fetches its own data now!
        return <BlogView />;
      default:
        return (
          <MainView
            data={portfolioData}
            setView={setCurrentView}
            setActiveProject={setActiveProject}
          />
        );
    }
  };

  const customStyles = `
    @keyframes loadingBar {
      0% { width: 0%; }
      100% { width: 100%; }
    }
    @keyframes zoomOutFade {
      0% { opacity: 0; transform: scale(1.05); }
      100% { opacity: 1; transform: scale(1); }
    }
  `;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-sans">
        <style>{customStyles}</style>
        <div className="animate-pulse text-[#00E5FF] font-black uppercase tracking-[0.3em] md:text-2xl text-lg drop-shadow-[0_0_15px_rgba(0,229,255,1)] text-center px-4">
          [ INITIALIZING TSG NODE ]
        </div>
        <div className="mt-8 w-64 h-1 bg-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-[#FF00FF] animate-[loadingBar_1.5s_ease-in-out_forwards] shadow-[0_0_15px_rgba(255,0,255,1)]"></div>
        </div>
      </div>
    );
  }

  const transitionKey = activeLegal
    ? activeLegal
    : activeProject
      ? activeProject.id
      : currentView;

  return (
    <div className="relative min-h-screen bg-black text-neutral-300 font-sans selection:bg-[#FF00FF]/30 selection:text-white">
      <style>{customStyles}</style>

      {/* Ambient Background Lights */}
      <div className="fixed top-0 left-0 w-[50vw] h-[50vw] bg-[#00E5FF] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-[50vw] h-[50vw] bg-[#FF00FF] rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none"></div>

      {/* Global Top Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 md:px-8 md:py-6 flex justify-between items-center shadow-2xl">
        {/* ADDED LOGO NEXT TO TSG TEXT */}
        <div
          className="flex items-center gap-3 font-black text-white uppercase tracking-[0.2em] cursor-pointer hover:text-[#00E5FF] transition-colors"
          onClick={() => handleNavClick("MAIN")}
        >
          <img
            src="/assets/img/logo.png"
            alt="TSG Logo"
            className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_0_10px_rgba(0,229,255,0.5)]"
          />
          <div>
            TSG <span className="text-white/50 mx-2">|</span>{" "}
            <span className="text-xs md:text-base">{currentView}</span>
          </div>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="md:hidden text-white flex flex-col justify-center gap-1.5 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? "opacity-0" : ""}`}
          ></span>
          <span
            className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          ></span>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 text-xs font-bold tracking-[0.15em] uppercase text-neutral-500">
          <button
            onClick={() => handleNavClick("MAIN")}
            className={`hover:text-white transition-colors ${currentView === "MAIN" && !activeProject && !activeLegal ? "text-white" : ""}`}
          >
            Main
          </button>
          <button
            onClick={() => handleNavClick("ABOUT")}
            className={`hover:text-white transition-colors ${currentView === "ABOUT" && !activeProject && !activeLegal ? "text-white" : ""}`}
          >
            Origin
          </button>
          <button
            onClick={() => handleNavClick("PROJECTS")}
            className={`hover:text-[#00E5FF] transition-colors ${currentView === "PROJECTS" || activeProject ? "text-[#00E5FF]" : ""}`}
          >
            History
          </button>
          <button
            onClick={() => handleNavClick("BLOG")}
            className={`hover:text-[#FF00FF] transition-colors ${currentView === "BLOG" && !activeProject && !activeLegal ? "text-[#FF00FF]" : ""}`}
          >
            Logs
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-3xl pt-24 px-8 flex flex-col gap-8 md:hidden">
          <button
            onClick={() => handleNavClick("MAIN")}
            className={`text-left text-xl font-black uppercase tracking-[0.2em] border-b border-white/5 pb-4 ${currentView === "MAIN" && !activeProject && !activeLegal ? "text-white" : "text-neutral-500"}`}
          >
            Main
          </button>
          <button
            onClick={() => handleNavClick("ABOUT")}
            className={`text-left text-xl font-black uppercase tracking-[0.2em] border-b border-white/5 pb-4 ${currentView === "ABOUT" && !activeProject && !activeLegal ? "text-white" : "text-neutral-500"}`}
          >
            Origin
          </button>
          <button
            onClick={() => handleNavClick("PROJECTS")}
            className={`text-left text-xl font-black uppercase tracking-[0.2em] border-b border-white/5 pb-4 ${currentView === "PROJECTS" || activeProject ? "text-[#00E5FF]" : "text-neutral-500"}`}
          >
            History
          </button>
          <button
            onClick={() => handleNavClick("BLOG")}
            className={`text-left text-xl font-black uppercase tracking-[0.2em] border-b border-white/5 pb-4 ${currentView === "BLOG" && !activeProject && !activeLegal ? "text-[#FF00FF]" : "text-neutral-500"}`}
          >
            Logs
          </button>
        </div>
      )}

      {/* Dynamic View Injection Container */}
      <main className="relative z-10 pt-32 md:pt-40 pb-32 px-6 md:px-8 max-w-7xl mx-auto min-h-[85vh]">
        <div
          key={transitionKey}
          style={{ animation: "zoomOutFade 0.6s ease-out forwards" }}
        >
          {renderView()}
        </div>
      </main>

      {/* Global Footer (Legal Links) */}
      <footer className="relative z-10 border-t border-white/10 bg-neutral-950 py-12 px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 text-center md:text-left">
          © {new Date().getFullYear()} Arta // The Sleeping Giant
        </div>
        <div className="flex gap-6 md:gap-8 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          <button
            onClick={() => {
              setActiveLegal("privacy");
              setActiveProject(null);
            }}
            className="hover:text-white transition-colors"
          >
            Privacy
          </button>
          <button
            onClick={() => {
              setActiveLegal("terms");
              setActiveProject(null);
            }}
            className="hover:text-white transition-colors"
          >
            Terms
          </button>
          <button
            onClick={() => {
              setActiveLegal("copyright");
              setActiveProject(null);
            }}
            className="hover:text-white transition-colors"
          >
            Copyright
          </button>
        </div>
      </footer>
    </div>
  );
}