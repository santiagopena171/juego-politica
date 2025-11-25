import fs from 'fs';

const filePath = 'countries_full_dataset_with_population.json';
const rawData = fs.readFileSync(filePath, 'utf8');
const sanitizedData = rawData.replace(/NaN/g, 'null');

fs.writeFileSync(filePath, sanitizedData);
console.log('Sanitized JSON file.');
