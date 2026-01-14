interface FooterProps {
    isDark: boolean;
    platformName: string;
}

export const Footer = ({ isDark, platformName }: FooterProps) => {
    return (
        <footer className={`${isDark ? 'border-gray-800 bg-gray-950/50' : 'border-gray-200 bg-white/50'} border-t backdrop-blur-sm mt-20`}>
            <div className="container mx-auto px-4 py-8 text-center">
                <p className={isDark ? 'text-gray-500' : 'text-gray-600'}>
                    © 2025 {platformName} Platform. All rights reserved.
                </p>
            </div>
        </footer>
    );
};
