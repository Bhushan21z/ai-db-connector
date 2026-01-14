import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
    isDark: boolean;
}

export const CTASection = ({ isDark }: CTASectionProps) => {
    return (
        <section className="container mx-auto px-4 py-20">
            <Card className={`p-12 md:p-16 text-center ${isDark ? 'bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 border-indigo-500/20' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-200'} backdrop-blur-sm relative overflow-hidden group`}>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to transform your
                        <br />
                        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                            database workflow?
                        </span>
                    </h2>
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-lg mb-10 max-w-2xl mx-auto`}>
                        Join developers who are already using AI to simplify their database operations.
                    </p>
                    <Button
                        size="lg"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-2xl shadow-indigo-500/40 hover:shadow-indigo-500/60 transition-all hover:scale-110 text-lg px-10 py-6 group"
                    >
                        Start Building Now
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </Button>
                </div>
            </Card>
        </section>
    );
};
