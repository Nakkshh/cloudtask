const techStack = [
  { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
  { name: "Vite", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vite/vite-original.svg" },
  { name: "Firebase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
  { name: "Java", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
  { name: "Spring Boot", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
  { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-plain.svg" },
  { name: "AWS", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg" },
  { name: "PostgreSQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
];

const TechStack = () => {
  return (
    <section id="tech" className="py-32 bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-16">
          Powered By
        </h2>
        
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-16 max-w-6xl mx-auto">
          {techStack.map((tech) => (
            <div key={tech.name} className="group p-8 rounded-3xl hover:bg-white shadow-xl hover:shadow-2xl border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:scale-105">
              <img
                src={tech.logo}
                alt={tech.name}
                className="w-20 h-20 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
              />
              <p className="font-bold text-lg text-gray-900">{tech.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechStack;
