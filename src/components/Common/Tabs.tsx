import React from 'react';

interface TabsProps {
    tabs: { label: string; id: string }[];
    activeTab: string;
    onTabClick: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick }) => {
    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabClick(tab.id)}
                        className={`
                            ${tab.id === activeTab
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

export default Tabs;