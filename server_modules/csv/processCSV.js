import fs from 'fs';
import csvToJson from 'convert-csv-to-json';
import { cleanCSVData, restoreNewlinesInJSON } from './utils.js';

const processCSV = (files, jsonData) => {
    Object.keys(files).forEach((key) => {
              const file = files[key][0];
              const filePath = file.path;
  
              // Read the CSV file content
              const csvString = fs.readFileSync(filePath, 'utf-8');
  
              // Clean the CSV data
              const cleanedCSVString = cleanCSVData(csvString);
  
              // Save the cleaned CSV data to a temporary file
              const tempFilePath = filePath + '.tmp';
              fs.writeFileSync(tempFilePath, cleanedCSVString);
  
              // Convert cleaned CSV to JSON
              const json = csvToJson.fieldDelimiter(',').supportQuotedField(true).getJsonFromCsv(tempFilePath);
  
              // Restore newlines in JSON data
              jsonData[key] = restoreNewlinesInJSON(json);
  
              // Delete the original and temporary CSV files
              fs.unlinkSync(filePath);
              fs.unlinkSync(tempFilePath);
          });
  };
  
  export default processCSV;