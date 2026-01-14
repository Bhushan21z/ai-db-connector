import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface FeatureCardProps {
    feature: {
        icon: any;
        title: string;
        description: string;
        gradient: string;
        stats: string;
        highlights: string[];
        example: string;
    };
    index: number;
    isDark: boolean;
}

export const FeatureCard = ({ feature, index, isDark }: FeatureCardProps) => {
    return (
        <Card
            className={`relative overflow-hidden ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200'} backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group cursor-pointer`}
            style={{ animationDelay: `${index * 0.1}s` }}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

            <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-gray-800/80' : 'bg-gray-100'} backdrop-blur-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <span className={`bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                        {feature.stats}
                    </span>
                </div>
            </div>

            <div className="p-8 relative z-10">
                <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                        <feature.icon className="h-8 w-8 text-white" />
                    </div>
                </div>

                <h3 className={`${isDark ? 'text-white' : 'text-black'} text-2xl font-bold mb-3 group-hover:bg-gradient-to-r group-hover:from-indigo-500 group-hover:to-purple-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300`}>
                    {feature.title}
                </h3>

                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed mb-6 text-sm`}>
                    {feature.description}
                </p>

                <div className="space-y-2 mb-6">
                    {feature.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {highlight}
                            </span>
                        </div>
                    ))}
                </div>

                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'} border font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} overflow-hidden`}>
                    <div className="truncate">{feature.example}</div>
                </div>

                <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className={`text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent flex items-center gap-1 hover:gap-2 transition-all`}>
                        Learn more
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
        </Card>
    );
};
