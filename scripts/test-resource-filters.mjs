import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const resources = JSON.parse(fs.readFileSync("data/midwest-city-resources.json", "utf8"));
const source = fs.readFileSync("resource-directory.js", "utf8").replace(/\ninitDirectory\(\);\s*$/, "");
const context = { Intl, console };
vm.createContext(context);
vm.runInContext(`${source}\nglobalThis.__filters = { quickNeedMap, matchesQuickNeed, matchesSearchQuery };`, context);

const { quickNeedMap, matchesQuickNeed, matchesSearchQuery } = context.__filters;
const quickNeeds = [
  ["Crisis", "Crisis Help"],
  ["Food", "Food"],
  ["Housing", "Housing"],
  ["Mental Health", "Mental Health"],
  ["Utilities", "Utilities"],
  ["Veterans", "Veterans"],
  ["Seniors", "Seniors"],
  ["Youth & Families", "Youth & Families"],
  ["Transportation", "Transportation"],
  ["City Services", "City Services"]
];

const counts = Object.fromEntries(quickNeeds.map(([label, key]) => {
  assert.ok(quickNeedMap[key], `Missing quick filter: ${key}`);
  const count = resources.filter((resource) => matchesQuickNeed(resource, key)).length;
  assert.ok(count > 0, `${label} quick filter should return at least one resource`);
  return [label, count];
}));

assert.equal(resources.filter((resource) => matchesQuickNeed(resource, "")).length, resources.length, "Clear Filters should return all resources");
assert.ok(resources.some((resource) => matchesSearchQuery(resource, "food pantry")), "Normal multi-word search should match exact phrases");
assert.ok(resources.some((resource) => matchesSearchQuery(resource, "pantry food")), "Normal multi-word search should match all tokens in any order");
assert.ok(resources.some((resource) => resource.category === "Food & Basic Needs"), "Category chips have matching category data");
assert.ok(resources.some((resource) => [...(resource.audiences || []), ...(resource.needs || [])].length > 0), "Audience/need dropdown has matching data");

console.log(JSON.stringify({ totalResources: resources.length, quickFilterCounts: counts }, null, 2));
