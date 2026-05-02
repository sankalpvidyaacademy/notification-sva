export const classSubjects: Record<string, string[]> = {
  "Class 4": ["A-4-8 Subject", "H-4-8 Subject", "R-4-8 Subject", "S-4-8 Subject"],
  "Class 5": ["A-4-8 Subject", "H-4-8 Subject", "R-4-8 Subject", "S-4-8 Subject"],
  "Class 6": ["A-4-8 Subject", "H-4-8 Subject", "R-4-8 Subject", "S-4-8 Subject"],
  "Class 7": ["A-4-8 Subject", "H-4-8 Subject", "R-4-8 Subject", "S-4-8 Subject"],
  "Class 8": ["A-4-8 Subject", "H-4-8 Subject", "R-4-8 Subject", "S-4-8 Subject"],
  "Class 9 CBSE": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "SST"],
  "Class 10 CBSE": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "SST"],
  "Class 9 ICSE": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "SST"],
  "Class 10 ICSE": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "SST"],
  "Class 11 Science": ["Mathematics", "Physics", "Chemistry", "Biology"],
  "Class 12 Science": ["Mathematics", "Physics", "Chemistry", "Biology"],
  "Class 11 Commerce": ["Accounts", "Business Studies", "Economics", "English", "Applied Mathematics"],
  "Class 12 Commerce": ["Accounts", "Business Studies", "Economics", "English", "Applied Mathematics"],
};

export const allClasses = Object.keys(classSubjects);

export function getSubjectsForClass(className: string): string[] {
  return classSubjects[className] || [];
}

export function getSubjectsForClasses(classNames: string[]): string[] {
  const subjectsSet = new Set<string>();
  for (const cls of classNames) {
    const subjects = classSubjects[cls] || [];
    subjects.forEach((s) => subjectsSet.add(s));
  }
  return Array.from(subjectsSet);
}
