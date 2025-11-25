import fs from 'fs';

const rawData = fs.readFileSync('countries_full_dataset.json', 'utf8');
const sanitizedData = rawData.replace(/NaN/g, 'null');
const data = JSON.parse(sanitizedData);

// Check specifically for population-like values
const popCheck = data.find(c => c.iso3 === 'USA');
if (popCheck) {
    console.log('USA Root Keys:', Object.keys(popCheck));
    if (popCheck.extra_indicators) {
        console.log('USA Indicators:', JSON.stringify(popCheck.extra_indicators, null, 2));
    }
}
