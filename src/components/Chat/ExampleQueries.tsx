import React, { FC } from 'react';
import { MessageSquare, Database, Code, TrendingUp } from 'lucide-react';
import { ApiDocument } from '../../services/apiService';

// --- INTERFACE DEFINITIONS ---
// Defines the structure for a single category of example queries.
interface ExampleCategory {
  category: string;
  // The 'icon' property is typed as React.ElementType, which correctly represents
  // a React component like those imported from lucide-react.
  icon: React.ElementType;
  color: string;
  queries: string[];
}

// Defines the props for the ExampleQueries component.
interface ExampleQueriesProps {
  configuredApis: ApiDocument[];
  onExampleClick: (query: string) => void;
  isItUser: boolean;
}


const ExampleQueries: FC<ExampleQueriesProps> = ({ configuredApis, onExampleClick, isItUser }) => {
  // Don't render the component if no data sources are configured.
  if (configuredApis.length === 0) {
    return null;
  }

  // Define the list of example queries. The content is now conditional based on user role.
  const exampleQueries: ExampleCategory[] = isItUser
    ? [ // Queries for IT Users
        {
            category: "General Information",
            icon: Database,
            color: "bg-blue-50 text-blue-700 border-blue-200",
            queries: [
                "What endpoints are available in my APIs?",
                "Show me all configured APIs and their descriptions",
                "What authentication methods do my APIs use?"
            ]
        },
        {
            category: "API Usage",
            icon: Code,
            color: "bg-green-50 text-green-700 border-green-200",
            queries: [
                "How can I get information about a specific user?",
                "What parameters does the search endpoint accept?",
                "Show me example requests for the products API"
            ]
        },
        {
            category: "Data Queries",
            icon: TrendingUp,
            color: "bg-purple-50 text-purple-700 border-purple-200",
            queries: [
                "What was the total number of sales last quarter?",
                "What were the top 5 products last quarter?",
                "Show me user activity statistics for the last month"
            ]
        }
      ]
    : [ // Queries for Business Users
        {
            category: "Data Queries",
            icon: TrendingUp,
            color: "bg-purple-50 text-purple-700 border-purple-200",
            queries: [
                "What was the total number of sales last quarter?",
                "What were the top 5 products last quarter?",
                "Show me user activity statistics for the last month"
            ]
        }
      ];

  // Handler for when a user clicks an example query button.
  const handleQueryClick = (query: string) => {
    if (onExampleClick) {
      onExampleClick(query);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col p-4 overflow-hidden">
      <div className="mb-4">
        <h4 className="text-lg font-medium text-gray-900 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
          Try these example questions
        </h4>
        <p className="text-sm text-gray-600 mt-1">
          Click on any question to start a conversation
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {exampleQueries.map((category) => {
          const IconComponent = category.icon;
          return (
            <div
              key={category.category}
              className={`border rounded-lg p-3 ${category.color} hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-center mb-2">
                <IconComponent className="w-4 h-4 mr-2" />
                <h5 className="font-medium text-sm">{category.category}</h5>
              </div>
              <div className="space-y-1">
                {category.queries.map((query) => (
                  <button
                    key={query}
                    onClick={() => handleQueryClick(query)}
                    className="block w-full text-left text-xs p-2 rounded bg-white/50 hover:bg-white/80 transition-colors duration-150"
                  >
                    • {query}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExampleQueries;