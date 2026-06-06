import data from "@/data/daleel-data.json";

export type Tool = { name: string; url: string };
export type Category = { id: string; name: string; tools: Tool[] };
export type Department = { id: string; name: string; cats: string[] };
export type College = { id: string; name: string; emoji: string; departments: Department[] };

export const colleges = data.colleges as College[];
export const categories = data.categories as Record<string, Category>;

export const getCollege = (id: string) => colleges.find((c) => c.id === id);
export const getDepartment = (collegeId: string, deptId: string) =>
  getCollege(collegeId)?.departments.find((d) => d.id === deptId);
export const getCategory = (id: string) => categories[id];

export const toolHref = (url: string) =>
  url.startsWith("http") ? url : `https://${url}`;