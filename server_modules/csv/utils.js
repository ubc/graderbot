/**
 * Cleans the CSV data by replacing newline characters within quoted fields
 * with a placeholder to prevent parsing issues.
 *
 * @param {string} csvString - The raw CSV data as a string.
 * @returns {string} - The cleaned CSV data with newlines within quoted fields replaced.
 */
export function cleanCSVData(csvString) {
    // Define a placeholder to replace newline characters within quoted fields
    const newlinePlaceholder = '<NEWLINE>';

    // Use a regular expression to match quoted fields and replace newlines within them
    const cleanedCSVString = csvString.replace(/"(.*?)"/gs, (match, p1) => {
        // Replace all newline characters within the matched quoted field with the placeholder
        return '"' + p1.replace(/\n/g, newlinePlaceholder) + '"';
    });

    // Return the cleaned CSV string
    return cleanedCSVString;
}

/**
 * Restores newline characters in JSON data that were previously replaced with a placeholder.
 *
 * @param {object|array|string} jsonData - The JSON data with placeholders for newlines.
 * @returns {object|array|string} - The JSON data with actual newline characters restored.
 */
export function restoreNewlinesInJSON(jsonData) {
    // Define the placeholder that was used to replace newline characters
    const newlinePlaceholder = '<NEWLINE>';

    /**
     * A recursive function to traverse the JSON data and replace the placeholders
     * with actual newline characters.
     *
     * @param {object|array|string} obj - The JSON data or a part of it.
     * @returns {object|array|string} - The processed data with newlines restored.
     */
    function traverseAndRestore(obj) {
        // Check if the current element is a string
        if (typeof obj === 'string') {
            // Replace all placeholders with actual newline characters
            return obj.replace(new RegExp(newlinePlaceholder, 'g'), '\n');
        }
        // Check if the current element is an array
        else if (Array.isArray(obj)) {
            // Map over the array and recursively process each element
            return obj.map(traverseAndRestore);
        }
        // Check if the current element is an object
        else if (typeof obj === 'object' && obj !== null) {
            // Create a new object to hold the processed data
            const newObj = {};
            // Iterate over the keys of the object
            for (const key in obj) {
                // Recursively process each value and assign it to the new object
                newObj[key] = traverseAndRestore(obj[key]);
            }
            // Return the new object
            return newObj;
        }
        // If the current element is neither a string, array, nor object, return it as is
        return obj;
    }

    // Start the traversal and restoration process from the root of the JSON data
    return traverseAndRestore(jsonData);
}
