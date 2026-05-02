import { NextRequest, NextResponse } from 'next/server';

const classSubjects: Record<string, string[]> = {
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const className = searchParams.get('class');

  if (!className) {
    // Return all class-subject mappings
    return NextResponse.json({ classSubjects, classes: Object.keys(classSubjects) });
  }

  const subjects = classSubjects[className];
  if (!subjects) {
    return NextResponse.json({ error: 'Invalid class name', subjects: [] }, { status: 400 });
  }

  return NextResponse.json({ subjects, classes: Object.keys(classSubjects) });
}
