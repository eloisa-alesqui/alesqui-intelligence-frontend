#!/bin/sh
set -e

# Inject runtime environment variables into the JavaScript bundle
# This allows the frontend to use environment variables set at container runtime
if [ -n "$VITE_API_BASE_URL" ]; then
    echo "Injecting VITE_API_BASE_URL: $VITE_API_BASE_URL"
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|$VITE_API_BASE_URL|g" {} \;
fi

# Execute the CMD
exec "$@"
