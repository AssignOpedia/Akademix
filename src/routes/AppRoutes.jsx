import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home/Home'
import Professors from '../pages/Professors/Professors'
import ProfessorProfile from '../pages/ProfessorProfile/ProfessorProfile'
import Subjects from '../pages/Subjects/Subjects'
import Universities from '../pages/Universities/Universities'
import Countries from '../pages/Countries/Countries'
import CountryDetails from '../pages/CountryDetails/CountryDetails'
import Courses from '../pages/Courses/Courses'
import CourseDetails from '../pages/CourseDetails/CourseDetails'
import Mentoring from '../pages/Mentoring/Mentoring'
import CareerGuidance from '../pages/CareerGuidance/CareerGuidance'
import About from '../pages/About/About'
import AssignmentGuidance from '../pages/AssignmentGuidance/AssignmentGuidance'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/professors" element={<Professors />} />
      <Route path="/professors/:id" element={<ProfessorProfile />} />
      <Route path="/subjects" element={<Subjects />} />
      <Route path="/subjects/:slug" element={<Subjects />} />
      <Route path="/departments" element={<Subjects />} />
      <Route path="/universities" element={<Universities />} />
      <Route path="/universities/:id" element={<Universities />} />
      <Route path="/countries" element={<Countries />} />
      <Route path="/countries/:code" element={<CountryDetails />} />
      <Route path="/courses/:id" element={<CourseDetails />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/mentoring" element={<Mentoring />} />
      <Route path="/assignment-guidance" element={<AssignmentGuidance />} />
      <Route path="/career-guidance" element={<CareerGuidance />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
