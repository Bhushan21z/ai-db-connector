import { MessageSquare, Key, Shield, Database, Zap, Code } from "lucide-react";

export const features = [
    {
        icon: MessageSquare,
        title: "Natural Language Queries",
        description: "Transform complex SQL into simple conversations. Just ask what you need in plain English.",
        gradient: "from-blue-500 to-cyan-500",
        stats: "10x Faster",
        highlights: ["No SQL knowledge required", "Context-aware responses", "Multi-step queries"],
        example: "Show me users who signed up last month"
    },
    {
        icon: Key,
        title: "API Access",
        description: "Integrate AI database queries into any application with our powerful REST API.",
        gradient: "from-purple-500 to-pink-500",
        stats: "99.9% Uptime",
        highlights: ["Instant token generation", "Rate limiting", "Webhook support"],
        example: "curl -X POST /api/query -H 'Bearer: token'"
    },
    {
        icon: Shield,
        title: "Secure & Encrypted",
        description: "Enterprise-grade security with AES-256 encryption and zero-trust architecture.",
        gradient: "from-green-500 to-emerald-500",
        stats: "SOC 2 Certified",
        highlights: ["End-to-end encryption", "Role-based access", "Audit logs"],
        example: "Your credentials never leave our secure vault"
    },
    {
        icon: Database,
        title: "Full CRUD Operations",
        description: "Complete database management with intelligent AI that understands relationships and constraints.",
        gradient: "from-orange-500 to-red-500",
        stats: "All Databases",
        highlights: ["PostgreSQL, MySQL, MongoDB", "Automatic joins", "Data validation"],
        example: "Update all inactive users from last year"
    },
    {
        icon: Zap,
        title: "Instant Responses",
        description: "Lightning-fast query execution with optimized AI processing and caching.",
        gradient: "from-yellow-500 to-orange-500",
        stats: "<500ms",
        highlights: ["Query optimization", "Smart caching", "Real-time results"],
        example: "Get insights in milliseconds, not minutes"
    },
    {
        icon: Code,
        title: "Developer Friendly",
        description: "Built by developers, for developers. Comprehensive docs and SDKs in multiple languages.",
        gradient: "from-indigo-500 to-purple-500",
        stats: "5 SDKs",
        highlights: ["Python, Node.js, Go, Ruby, PHP", "OpenAPI specs", "Code examples"],
        example: "npm install @dbai/client"
    }
];
