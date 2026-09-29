import { departments } from './departments'
import { professors } from './professors'
import { universities } from './universities'
import { careerPaths } from './careerPaths'
import { div } from 'framer-motion/client'

const foundations = {
  Mathematics: ['Science & Research', 'Business & Finance'], Physics: ['Science & Research', 'Engineering & Technology'],
  Chemistry: ['Science & Research', 'Medical & Health'], Biology: ['Science & Research', 'Medical & Health'],
  English: ['Humanities & Social Sciences'], History: ['Humanities & Social Sciences'],
  Geography: ['Humanities & Social Sciences', 'Science & Research'], Economics: ['Business & Finance', 'Humanities & Social Sciences'],
  'Political Science': ['Humanities & Social Sciences', 'Law'], Sociology: ['Humanities & Social Sciences'],
  Psychology: ['Medical & Health', 'Humanities & Social Sciences'], 'Computer Science': ['Computer Science', 'Engineering & Technology'],
  Statistics: ['Science & Research', 'Business & Finance'], 'Environmental Science': ['Science & Research', 'Engineering & Technology'],
  Accountancy: ['Business & Finance'], 'Business Studies': ['Business & Finance'],
}

const domainGuides = {
  'Computer Science': {
    focus: (name) => `${name} develops computational ways to represent problems, design solutions, and reason about how digital systems behave.`,
    topics: ['Programming and computational thinking', 'Algorithms and data', 'Software and systems design', 'Testing and responsible computing'],
    style: 'Concepts are learned through coding exercises, debugging, technical reading, and building increasingly complete systems.',
    skills: ['Logical reasoning', 'Problem solving', 'Computational thinking', 'Clear technical communication'],
    project: (name) => `Design and build a small ${name.toLowerCase()} application, test it with users or sample data, and explain the design choices.`,
    prerequisites: 'Useful preparation includes mathematics, logical reasoning, and comfort experimenting with computers; formal coding experience is often not required.',
    careers: ['Software Developer', 'Systems Analyst', 'Technology Researcher'],
  },
  'Engineering & Technology': {
    focus: (name) => `${name} applies scientific and mathematical ideas to design, test, and improve technologies or infrastructure.`,
    topics: ['Engineering principles and modelling', 'Materials, components, or systems', 'Design constraints and safety', 'Testing and optimization'],
    style: 'Learning combines theory with calculations, practical laboratories, design studios, and iterative team projects.',
    skills: ['Quantitative reasoning', 'Design thinking', 'Testing and analysis', 'Team problem solving'],
    project: (name) => `Develop a prototype or engineering design for a ${name.toLowerCase()} challenge, then test it against performance and safety constraints.`,
    prerequisites: 'Mathematics and relevant sciences are useful foundations. Specific entry subjects depend on the programme and destination.',
    careers: ['Engineer', 'Design Specialist', 'Technical Researcher'],
  },
  'Business & Finance': {
    focus: (name) => `${name} examines how organizations, markets, and people make decisions and allocate resources.`,
    topics: ['Business and market fundamentals', 'Quantitative analysis', 'Strategy and decision making', 'Ethics and communication'],
    style: 'Case studies, data interpretation, presentations, group work, and applied analysis connect concepts to organizations.',
    skills: ['Analytical reasoning', 'Numeracy', 'Decision making', 'Communication'],
    project: (name) => `Use evidence to develop a ${name.toLowerCase()} case study, evaluate options, and present a justified recommendation.`,
    prerequisites: 'Numeracy, reading, and written communication help. Check each programme for any required mathematics or business background.',
    careers: ['Business Analyst', 'Financial Analyst', 'Strategy Associate'],
  },
  Law: {
    focus: (name) => `${name} studies legal rules, institutions, and arguments related to people, organizations, and society.`,
    topics: ['Legal systems and principles', 'Reading statutes and cases', 'Argument and evidence', 'Ethics and public context'],
    style: 'Close reading, structured discussion, case analysis, research, and clear evidence-based writing are central.',
    skills: ['Critical reading', 'Reasoned argument', 'Research', 'Precise writing'],
    project: (name) => `Research a current ${name.toLowerCase()} question and prepare a balanced case analysis supported by primary and secondary sources.`,
    prerequisites: 'Strong reading, writing, and careful reasoning are valuable. Law entry routes and professional qualification differ by country.',
    careers: ['Legal Researcher', 'Policy Analyst', 'Compliance Specialist'],
  },
  'Medical & Health': {
    focus: (name) => `${name} explores health, wellbeing, and evidence-informed ways to understand or improve outcomes for individuals and communities.`,
    topics: ['Human health and systems', 'Evidence and research methods', 'Ethics and professional practice', 'Prevention or intervention'],
    style: 'Study may blend scientific foundations, case-based learning, laboratories, supervised practice, and reflection.',
    skills: ['Evidence evaluation', 'Observation', 'Empathy and communication', 'Ethical judgement'],
    project: (name) => `Develop an evidence review or supervised project exploring a focused ${name.toLowerCase()} question and its implications for people or communities.`,
    prerequisites: 'Relevant sciences and communication are useful. Clinical programmes may have regulated admission and placement requirements.',
    careers: ['Health Researcher', 'Public Health Specialist', 'Further professional study'],
  },
  'Humanities & Social Sciences': {
    focus: (name) => `${name} investigates people, ideas, cultures, institutions, and how societies change over time.`,
    topics: ['Foundational theories and debates', 'People, communities, and institutions', 'Evidence and interpretation', 'Research and communication'],
    style: 'Learning emphasizes reading, discussion, source analysis, field or archival research, and developing a supported perspective.',
    skills: ['Critical thinking', 'Research', 'Interpretation', 'Writing and communication'],
    project: (name) => `Investigate a focused ${name.toLowerCase()} question using appropriate sources, interviews, texts, or data and communicate the findings.`,
    prerequisites: 'Curiosity, reading, and written communication are useful foundations. Subject-specific background is usually built during study.',
    careers: ['Researcher', 'Community or Policy Specialist', 'Communications Professional'],
  },
  'Design & Creative': {
    focus: (name) => `${name} combines creative exploration with methods for making, communicating, and refining ideas for an audience or purpose.`,
    topics: ['Visual and conceptual foundations', 'Tools, materials, or media', 'Audience and context', 'Critique and iteration'],
    style: 'Studio work, making, critique, experimentation, and portfolio development are balanced with research and communication.',
    skills: ['Creative thinking', 'Visual communication', 'Iteration', 'Portfolio presentation'],
    project: (name) => `Create a small ${name.toLowerCase()} portfolio project, document the research and iterations, and present the final work for critique.`,
    prerequisites: 'Creative curiosity and willingness to iterate help. Some programmes request a portfolio; requirements vary by institution.',
    careers: ['Designer', 'Creative Researcher', 'Digital Media Specialist'],
  },
  'Science & Research': {
    focus: (name) => `${name} uses observation, evidence, and systematic investigation to explain patterns in the natural or quantitative world.`,
    topics: ['Core concepts and models', 'Measurement and data', 'Experimental or analytical methods', 'Evidence and uncertainty'],
    style: 'Conceptual study is paired with problem sets, practical laboratories, data analysis, and research communication.',
    skills: ['Quantitative reasoning', 'Scientific inquiry', 'Data interpretation', 'Evidence-based communication'],
    project: (name) => `Plan a small ${name.toLowerCase()} investigation, collect or analyze suitable data, and communicate methods, findings, and limitations.`,
    prerequisites: 'Mathematics and relevant sciences help build foundations. Check programmes for specific subject prerequisites.',
    careers: ['Research Scientist', 'Data Analyst', 'Science Educator'],
  },
}

function departmentsFor(name) {
  const exact = departments.filter((department) => department.subjects.includes(name))
  if (exact.length) return exact
  const names = foundations[name] ?? []
  return departments.filter((department) => names.includes(department.name))
}

export function getSubjectComparisonProfile(name) {
  const relatedDepartments = departmentsFor(name)
  const primaryDepartment = relatedDepartments[0]
  const guide = domainGuides[primaryDepartment?.name] ?? domainGuides['Science & Research']
  const relatedSubjects = [...new Set(relatedDepartments.flatMap((department) => department.subjects))].filter((subject) => subject !== name)
  const relevantProfessors = professors.filter((professor) => professor.subjects.includes(name))
  const departmentProfessors = professors.filter((professor) => relatedDepartments.some((department) => professor.department === department.name))
  const professorMatches = [...new Map([...relevantProfessors, ...departmentProfessors].map((professor) => [professor.id, professor])).values()]
  const exactUniversities = universities.filter((university) => university.popularSubjects.includes(name))
  const departmentUniversities = universities.filter((university) => relatedDepartments.some((department) => university.departments.includes(department.name)))
  const universityMatches = [...new Map([...exactUniversities, ...departmentUniversities].map((university) => [university.id, university])).values()]
  const pathways = [`Study ${name} at undergraduate level`, `Consider advanced study or a related specialization`]
  const careersForSubject = careerPaths[name] ?? guide.careers
  const skills = [...new Set(guide.skills)]
  const topics = [...new Set(guide.topics)]

  return {
    name,
    coreFocus: guide.focus(name),
    keyTopics: topics,
    learningStyle: guide.style,
    coreSkills: skills,
    typicalProjects: `Illustrative project idea, not a confirmed programme requirement: ${guide.project(name)}`,
    prerequisites: guide.prerequisites,
    academicPathways: pathways.length ? pathways : [`Foundational study → ${name} focus`, `Further study in ${name} or a related discipline`],
    careerDirections: careersForSubject.slice(0, 5),
    professors: professorMatches.map((professor) => ({
      ...professor,
      matchType: relevantProfessors.includes(professor) ? 'Subject match' : 'Related department',
    })),
    universities: universityMatches.map((university) => ({
      ...university,
      matchType: exactUniversities.includes(university) ? 'Subject match' : 'Related department',
    })),
    relatedFields: relatedSubjects.slice(0, 6),
    professorIds: professorMatches.slice(0, 3).map((professor) => professor.id),
    universityIds: universityMatches.slice(0, 3).map((university) => university.id),
    departmentNames: relatedDepartments.map((department) => department.name),
  }
}

export function getSubjectConnections(profileA, profileB) {
  const sharedDepartments = profileA.departmentNames.filter((department) => profileB.departmentNames.includes(department))
  const overlappingTopics = profileA.keyTopics.filter((topic) => profileB.keyTopics.includes(topic))
  const sharedSkills = profileA.coreSkills.filter((skill) => profileB.coreSkills.includes(skill))
  const sharedConcepts = sharedDepartments.map((department) => `Both subjects are listed under ${department}.`)

  return {
    sharedConcepts,
    transferableSkills: sharedSkills,
    overlappingTopics,
    projectIdeas: `Illustrative idea, not a standard assignment: frame a question using ${profileA.name}, then explore whether a method from ${profileB.name} can add a useful perspective. Choose a topic and methods with guidance from instructors in both fields.`,
    combination: `Where an institution offers suitable options, students may combine ${profileA.name} and ${profileB.name} through electives, a minor or concentration, interdisciplinary research, or a project using methods from both. Check the programme catalogue for availability.`,
  }
}





























