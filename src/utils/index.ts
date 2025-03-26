// filepath: /GSBVTTMobile/GSBVTTMobile/src/utils/index.ts

export const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US');
};

export const handleApiResponse = (response: Response) => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

// Additional utility functions can be added here