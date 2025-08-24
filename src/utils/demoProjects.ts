// Demo project descriptions for testing
export const DEMO_PROJECTS = [
  {
    name: "E-commerce Store",
    description: "A modern e-commerce platform with product catalog, shopping cart, user authentication, payment processing, and admin dashboard. Features include product search, filtering, user reviews, order tracking, and inventory management.",
    framework: "react",
    styling: "tailwind",
    backend: "nodejs",
    database: "postgresql",
    features: ["Authentication", "User Dashboard", "Payment Integration", "Admin Panel", "Search Functionality"]
  },
  {
    name: "Social Media Dashboard",
    description: "A comprehensive social media management tool that allows users to schedule posts, analyze engagement metrics, manage multiple accounts, and collaborate with team members. Includes real-time notifications and detailed analytics.",
    framework: "react",
    styling: "tailwind", 
    backend: "nodejs",
    database: "mongodb",
    features: ["Authentication", "User Dashboard", "Real-time Updates", "API Integration", "File Upload"]
  },
  {
    name: "Project Management Tool",
    description: "A collaborative project management application with task tracking, team collaboration, file sharing, time tracking, and project reporting. Features kanban boards, calendar integration, and team chat.",
    framework: "react",
    styling: "tailwind",
    backend: "nodejs", 
    database: "postgresql",
    features: ["Authentication", "User Dashboard", "Real-time Updates", "File Upload", "Email Notifications"]
  },
  {
    name: "Learning Management System",
    description: "An online learning platform with course creation, student enrollment, progress tracking, assignments, quizzes, and video streaming. Includes instructor tools and student analytics.",
    framework: "react",
    styling: "tailwind",
    backend: "nodejs",
    database: "postgresql", 
    features: ["Authentication", "User Dashboard", "File Upload", "Payment Integration", "Email Notifications"]
  },
  {
    name: "Real Estate Platform", 
    description: "A property listing and management platform with advanced search, property comparisons, virtual tours, agent profiles, and lead management. Features map integration and mortgage calculators.",
    framework: "react",
    styling: "tailwind",
    backend: "nodejs",
    database: "postgresql",
    features: ["Authentication", "Search Functionality", "File Upload", "API Integration", "User Dashboard"]
  }
];

export const getRandomDemoProject = () => {
  return DEMO_PROJECTS[Math.floor(Math.random() * DEMO_PROJECTS.length)];
};
