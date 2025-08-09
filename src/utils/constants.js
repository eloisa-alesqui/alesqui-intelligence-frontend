// Application constants

// API Endpoints
export const API_ENDPOINTS = {
    SWAGGER: {
        IMPORT: '/api/swagger/import',
        LIST: '/api/swagger/list',
        DELETE: '/api/swagger/delete'
    },
    POSTMAN: {
        IMPORT: '/api/postman/import',
        LIST: '/api/postman/list',
        DELETE: '/api/postman/delete'
    },
    UNIFICATION: {
        UNIFY: '/api/unification/unify',
        STATUS: '/api/unification/status',
        LIST: '/api/unification/list'
    },
    CHAT: {
        MESSAGE: '/api/chat/message',
        HISTORY: '/api/chat/history',
        CLEAR: '/api/chat/clear'
    }
};

// File Upload Constants
export const FILE_UPLOAD = {
    MAX_SIZE: {
        SWAGGER: 10 * 1024 * 1024, // 10MB
        POSTMAN: 5 * 1024 * 1024,  // 5MB
        DEFAULT: 10 * 1024 * 1024  // 10MB
    },
    ACCEPTED_TYPES: {
        SWAGGER: '.json,.yaml,.yml',
        POSTMAN: '.json',
        JSON: 'application/json',
        YAML: 'application/x-yaml,text/yaml'
    }
};

// UI Constants
export const UI = {
    NOTIFICATION_DURATION: 5000, // 5 seconds
    CHAT_MESSAGE_MAX_LENGTH: 500,
    API_NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    TEAM_NAME_MAX_LENGTH: 50
};

// Navigation Tabs
export const TABS = {
    SETUP: 'setup',
    APIS: 'apis',
    CHAT: 'chat'
};

// Setup Steps
export const SETUP_STEPS = {
    SWAGGER: 1,
    POSTMAN: 2,
    UNIFY: 3
};

// Button Variants
export const BUTTON_VARIANTS = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    SUCCESS: 'success',
    WARNING: 'warning',
    DANGER: 'danger',
    OUTLINE: 'outline',
    GHOST: 'ghost',
    LINK: 'link'
};

// Button Sizes
export const BUTTON_SIZES = {
    XS: 'xs',
    SM: 'sm',
    MD: 'md',
    LG: 'lg',
    XL: 'xl'
};

// Input Sizes
export const INPUT_SIZES = {
    SM: 'sm',
    MD: 'md',
    LG: 'lg'
};

// Notification Types
export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

// Chat Message Types
export const MESSAGE_TYPES = {
    USER: 'user',
    BOT: 'bot',
    SYSTEM: 'system'
};

// API Status
export const API_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    ERROR: 'error'
};

// Color Schemes
export const COLORS = {
    SWAGGER: {
        PRIMARY: 'blue',
        CLASSES: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    POSTMAN: {
        PRIMARY: 'orange',
        CLASSES: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    UNIFY: {
        PRIMARY: 'green',
        CLASSES: 'bg-green-50 text-green-700 border-green-200'
    },
    SUCCESS: {
        PRIMARY: 'green',
        CLASSES: 'bg-green-50 text-green-800 border-green-200'
    },
    ERROR: {
        PRIMARY: 'red',
        CLASSES: 'bg-red-50 text-red-800 border-red-200'
    },
    WARNING: {
        PRIMARY: 'yellow',
        CLASSES: 'bg-yellow-50 text-yellow-800 border-yellow-200'
    },
    INFO: {
        PRIMARY: 'blue',
        CLASSES: 'bg-blue-50 text-blue-800 border-blue-200'
    }
};

// Step Status
export const STEP_STATUS = {
    PENDING: 'pending',
    CURRENT: 'current',
    COMPLETED: 'completed'
};

// File Upload Variants
export const FILE_UPLOAD_VARIANTS = {
    DEFAULT: 'default',
    DROPZONE: 'dropzone',
    BUTTON: 'button'
};

// Validation Rules
export const VALIDATION = {
    API_NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
        PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
        ERROR_MESSAGES: {
            REQUIRED: 'API name is required',
            MIN_LENGTH: 'API name must be at least 2 characters',
            MAX_LENGTH: 'API name cannot exceed 100 characters',
            PATTERN: 'API name can only contain letters, numbers, spaces, hyphens and underscores'
        }
    },
    TEAM_NAME: {
        MAX_LENGTH: 50,
        PATTERN: /^[a-zA-Z0-9\s\-_]*$/,
        ERROR_MESSAGES: {
            MAX_LENGTH: 'Team name cannot exceed 50 characters',
            PATTERN: 'Team name can only contain letters, numbers, spaces, hyphens and underscores'
        }
    },
    DESCRIPTION: {
        MAX_LENGTH: 500,
        ERROR_MESSAGES: {
            MAX_LENGTH: 'Description cannot exceed 500 characters'
        }
    },
    FILE: {
        ERROR_MESSAGES: {
            SIZE_EXCEEDED: 'File size exceeds the maximum allowed limit',
            INVALID_TYPE: 'File type is not supported',
            UPLOAD_FAILED: 'Failed to upload file. Please try again.'
        }
    }
};

// Default Values
export const DEFAULTS = {
    TEAM_NAME: 'Default',
    CREATED_BY: 'Admin',
    PAGINATION: {
        PAGE_SIZE: 10,
        DEFAULT_PAGE: 1
    },
    CHAT: {
        MAX_HISTORY: 100,
        TYPING_DELAY: 1000
    }
};

// Local Storage Keys
export const STORAGE_KEYS = {
    USER_PREFERENCES: 'postmanGPT_userPreferences',
    CHAT_HISTORY: 'postmanGPT_chatHistory',
    API_CACHE: 'postmanGPT_apiCache',
    LAST_ACTIVE_TAB: 'postmanGPT_lastActiveTab'
};

// Error Messages
export const ERROR_MESSAGES = {
    GENERIC: 'An unexpected error occurred. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    SERVER: 'Server error. Please try again later.',
    UPLOAD: {
        FAILED: 'File upload failed. Please try again.',
        SIZE_LIMIT: 'File size exceeds the maximum limit.',
        TYPE_NOT_SUPPORTED: 'File type is not supported.',
        CORRUPTED: 'File appears to be corrupted or invalid.'
    },
    API: {
        NOT_FOUND: 'API not found.',
        ALREADY_EXISTS: 'An API with this name already exists.',
        UNIFICATION_FAILED: 'Failed to unify API collections.',
        CONFIGURATION_INVALID: 'API configuration is invalid.'
    },
    CHAT: {
        MESSAGE_EMPTY: 'Please enter a message.',
        MESSAGE_TOO_LONG: 'Message is too long. Please keep it under 500 characters.',
        NO_APIS_CONFIGURED: 'No APIs are configured. Please configure at least one API to start chatting.',
        SERVICE_UNAVAILABLE: 'Chat service is temporarily unavailable.'
    }
};

// Success Messages
export const SUCCESS_MESSAGES = {
    API: {
        CONFIGURED: 'API configured successfully!',
        DELETED: 'API removed successfully.',
        SWAGGER_UPLOADED: 'Swagger collection uploaded successfully.',
        POSTMAN_UPLOADED: 'Postman collection uploaded successfully.',
        UNIFIED: 'API unified successfully.'
    },
    CHAT: {
        MESSAGE_SENT: 'Message sent successfully.',
        HISTORY_CLEARED: 'Chat history cleared.'
    },
    GENERAL: {
        SAVED: 'Changes saved successfully.',
        COPIED: 'Copied to clipboard.',
        EXPORTED: 'Data exported successfully.'
    }
};

// Example Queries for Chat
export const EXAMPLE_QUERIES = {
    GENERAL: [
        "What endpoints are available in my APIs?",
        "Show me all configured APIs and their descriptions",
        "What authentication methods do my APIs use?"
    ],
    DATA: [
        "What was the total number of sales last quarter?",
        "What were the top 5 products last quarter?",
        "Show me user activity statistics"
    ],
    USAGE: [
        "How can I get information about a specific user?",
        "What parameters does the search endpoint accept?",
        "Show me example requests for the products API"
    ],
    QUICK_ACTIONS: [
        "List all users created this month",
        "Find products with low inventory",
        "Show recent order transactions"
    ]
};

// Feature Flags (for future development)
export const FEATURES = {
    DRAG_AND_DROP_UPLOAD: true,
    CHAT_HISTORY_PERSISTENCE: true,
    API_VERSIONING: false,
    BULK_API_IMPORT: false,
    REAL_TIME_CHAT: false,
    API_TESTING: false,
    COLLABORATION: false
};

// Environment Configuration
export const ENV = {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production'
};

// Rate Limiting
export const RATE_LIMITS = {
    CHAT_MESSAGES_PER_MINUTE: 30,
    API_UPLOADS_PER_HOUR: 10,
    FILE_UPLOAD_CONCURRENT: 3
};

// Animation Durations (in milliseconds)
export const ANIMATIONS = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    NOTIFICATION: 5000,
    TOOLTIP: 200
};

// Breakpoints (for responsive design)
export const BREAKPOINTS = {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px'
};

// Z-Index Layers
export const Z_INDEX = {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    NOTIFICATION: 1080
};