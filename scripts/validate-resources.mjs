import fs from 'node:fs';

const file = process.argv[2] || 'data/midwest-city-resources.json';
const required = ['name', 'category', 'description', 'phone', 'website', 'address', 'hours', 'eligibility', 'lastVerified', 'sourceUrl', 'confidence'];
const allowedConfidence = new Set(['High', 'Medium', 'Low']);
const resources = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];

if (!Array.isArray(resources)) errors.push('Top-level JSON value must be an array.');
resources.forEach((resource, index) => {
  required.forEach((field) => {
    if (!resource[field] || String(resource[field]).trim() === '') errors.push(`#${index + 1} ${resource.name || '(unnamed)'} is missing ${field}.`);
  });
  if (!Array.isArray(resource.audiences)) errors.push(`#${index + 1} ${resource.name || '(unnamed)'} audiences must be an array.`);
  if (!Array.isArray(resource.needs)) errors.push(`#${index + 1} ${resource.name || '(unnamed)'} needs must be an array.`);
  if (resource.confidence && !allowedConfidence.has(resource.confidence)) errors.push(`#${index + 1} ${resource.name} has invalid confidence: ${resource.confidence}.`);
  ['website', 'sourceUrl'].forEach((field) => {
    try { new URL(resource[field]); } catch { errors.push(`#${index + 1} ${resource.name || '(unnamed)'} has invalid ${field}.`); }
  });
  if (resource.lastVerified && !/^\d{4}-\d{2}-\d{2}$/.test(resource.lastVerified)) errors.push(`#${index + 1} ${resource.name} lastVerified must use YYYY-MM-DD.`);
});

if (errors.length) {
  console.error(`Resource validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Validated ${resources.length} resources in ${file}.`);
