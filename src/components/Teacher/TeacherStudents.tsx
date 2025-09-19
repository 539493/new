import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  MessageCircle, 
  User as UserIcon, 
  Info, 
  Eye, 
  FileText,
  X,
  Phone,
  Mail,
  MapPin,
  School,
  GraduationCap,
  Target,
  BookOpen,
  Clock,
  Users,
  Star,
  Heart,
  Award,
  TrendingUp
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import type { StudentProfile } from '../../types';
import { TimeSlot } from '../../types';
import TeacherCalendar from './TeacherCalendar';
import Modal from '../../components/Shared/Modal';
import UserProfile from '../Shared/UserProfile';

// Р’СЃРїРѕРјРѕРіР°С‚РµР»СЊРЅР°СЏ С„СѓРЅРєС†РёСЏ РґР»СЏ РїРѕР»СѓС‡РµРЅРёСЏ РїСЂРѕС„РёР»СЏ СѓС‡РµРЅРёРєР° РїРѕ studentId
function getStudentProfile(studentId: string) {
  try {
    const users = JSON.parse(localStorage.getItem('tutoring_users') || '[]');
    const student = users.find((u: any) => u.id === studentId && u.role === 'student');
    return student?.profile as StudentProfile | undefined;
  } catch {
    return undefined;

const TeacherStudents: React.FC = () => {
  const { lessons, studentProfiles, createSlot, bookLesson } = useData();
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<null | { studentName: string; studentId: string }>();
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState<{ id: string; name: string } | null>(null);
  const [slotForm, setSlotForm] = useState({
    subject: '',
    date: '',
    startTime: '',
    endTime: '',
    duration: 60,
    lessonType: 'regular' as 'regular' | 'trial',
    format: 'online' as 'online' | 'offline',
    price: 1000,
    experience: 'beginner' as 'beginner' | 'experienced',
    grades: [] as string[],
    goals: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarStudent, setCalendarStudent] = useState<{ id: string; name: string } | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<string | null>(null);

  // РЎРѕР±РёСЂР°РµРј РІСЃРµС… СѓС‡РµРЅРёРєРѕРІ, РєРѕС‚РѕСЂС‹Рµ Р±СЂРѕРЅРёСЂРѕРІР°Р»Рё СѓСЂРѕРєРё Сѓ СЌС‚РѕРіРѕ РїСЂРµРїРѕРґР°РІР°С‚РµР»СЏ
  const teacherLessons = lessons.filter(lesson => lesson.teacherId === user?.id);
  const studentsMap: Record<string, { studentName: string; studentId: string; lessons: typeof teacherLessons }> = {};
  teacherLessons.forEach(lesson => {
    if (!studentsMap[lesson.studentId]) {
      studentsMap[lesson.studentId] = {
        studentName: lesson.studentName,
        studentId: lesson.studentId,
        lessons: [],
      };
    }
    studentsMap[lesson.studentId].lessons.push(lesson);
  });

  const handleOpenChat = (studentId: string, studentName: string) => {
    alert(`Р§Р°С‚ СЃ ${studentName} РѕС‚РєСЂС‹С‚! РџРµСЂРµР№РґРёС‚Рµ РІ СЂР°Р·РґРµР» 'Р§Р°С‚С‹' РґР»СЏ РѕР±С‰РµРЅРёСЏ.`);
  };

  const handleCardClick = (student: { studentName: string; studentId: string }) => {
    setSelectedStudent(student);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStudent(null);
  };

  // Р¤СѓРЅРєС†РёСЏ РѕС‚РєСЂС‹С‚РёСЏ РјРѕРґР°Р»СЊРЅРѕРіРѕ РѕРєРЅР° РґР»СЏ РЅР°Р·РЅР°С‡РµРЅРёСЏ СѓСЂРѕРєР°
  const handleAssignLesson = (student: { id: string; name: string }) => {
    setAssigningStudent(student);
    setAssignModalOpen(true);
    setSlotForm({
      subject: '',
      date: '',
      startTime: '',
      endTime: '',
      duration: 60,
      lessonType: 'regular',
      format: 'online',
      price: 1000,
      experience: 'beginner',
      grades: [],
      goals: [],
    });
    setError('');
  };

  // РћС‚РєСЂС‹С‚СЊ РєР°Р»РµРЅРґР°СЂСЊ РґР»СЏ РЅР°Р·РЅР°С‡РµРЅРёСЏ СѓСЂРѕРєР°
  const handleOpenCalendar = (student: { id: string; name: string }) => {
    setCalendarStudent(student);
    setCalendarModalOpen(true);
  };

  // Р¤СѓРЅРєС†РёСЏ СЃРѕР·РґР°РЅРёСЏ Рё Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏ СЃР»РѕС‚Р°
  const handleCreateAndBookSlot = async () => {
    if (!user || !assigningStudent) return;
    setLoading(true);
    setError('');
    try {
      await createSlot({
        ...slotForm,
        teacherId: user.id,
        teacherName: user.name,
      }, assigningStudent.id, assigningStudent.name, { mode: 'assign' });
      setAssignModalOpen(false);
    } catch (e) {
      setError('РћС€РёР±РєР° РїСЂРё СЃРѕР·РґР°РЅРёРё РёР»Рё Р±СЂРѕРЅРёСЂРѕРІР°РЅРёРё СЃР»РѕС‚Р°');
    } finally {
      setLoading(false);
  };

  // РџРѕР»СѓС‡РёС‚СЊ РїСЂРѕС„РёР»СЊ РІС‹Р±СЂР°РЅРЅРѕРіРѕ СѓС‡РµРЅРёРєР°
  const selectedProfile = selectedStudent ? studentProfiles[selectedStudent.studentId] : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">РЈС‡РµРЅРёРєРё</h1>
        <p className="text-gray-600">Р—РґРµСЃСЊ РѕС‚РѕР±СЂР°Р¶Р°СЋС‚СЃСЏ РІСЃРµ СѓС‡РµРЅРёРєРё, РєРѕС‚РѕСЂС‹Рµ Р±СЂРѕРЅРёСЂРѕРІР°Р»Рё Сѓ РІР°СЃ СѓСЂРѕРєРё, Рё РёСЃС‚РѕСЂРёСЏ РІР°С€РёС… Р·Р°РЅСЏС‚РёР№ СЃ РЅРёРјРё</p>
      </div>
      {students.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UserIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">РџРѕРєР° РЅРµС‚ СѓС‡РµРЅРёРєРѕРІ</h3>
          <p className="text-gray-600">РЈС‡РµРЅРёРєРё РїРѕСЏРІСЏС‚СЃСЏ Р·РґРµСЃСЊ РїРѕСЃР»Рµ Р±СЂРѕРЅРёСЂРѕРІР°РЅРёСЏ СѓСЂРѕРєРѕРІ</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map(student => (
            <div
              key={student.studentId}
              className="card-gradient hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer"
              onClick={() => handleCardClick(student)}
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{student.studentName}</h3>
                  </div>
                  <div className="ml-auto flex items-center space-x-1">
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="РџСЂРѕСЃРјРѕС‚СЂРµС‚СЊ Р·Р°РїРёСЃРё"
                      onClick={e => { e.stopPropagation(); setSelectedUserProfile(student.studentId); }}
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title="РџРѕРґСЂРѕР±РЅРµРµ Рѕ РїСЂРѕС„РёР»Рµ"
                      onClick={e => { e.stopPropagation(); handleCardClick(student); }}
                    >
                      <Info className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-md font-bold text-gray-800 mb-2 flex items-center"><Calendar className="h-4 w-4 mr-1 text-blue-500" />Р—Р°Р±СЂРѕРЅРёСЂРѕРІР°РЅРЅС‹Рµ СѓСЂРѕРєРё</h4>
                  {student.lessons.length === 0 ? (
                    <div className="text-gray-500 text-sm">РќРµС‚ СѓСЂРѕРєРѕРІ</div>
                  ) : (
                    <ul className="space-y-2">
                      {student.lessons.map(lesson => (
                        <li key={lesson.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                          <div>
                            <span className="font-medium text-gray-700">{lesson.subject}</span>
                            <span className="ml-2 text-xs text-gray-500">{lesson.date} {lesson.startTime}-{lesson.endTime}</span>
                            <span className="ml-2 text-xs text-gray-500">({lesson.status === 'completed' ? 'Р—Р°РІРµСЂС€РµРЅ' : 'Р—Р°РїР»Р°РЅРёСЂРѕРІР°РЅ'})</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={e => { e.stopPropagation(); handleOpenChat(student.studentId, student.studentName); }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                              title="Р§Р°С‚ СЃ СѓС‡РµРЅРёРєРѕРј"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* РџРѕР»РЅРѕС†РµРЅРЅРѕРµ РјРѕРґР°Р»СЊРЅРѕРµ РѕРєРЅРѕ РїСЂРѕС„РёР»СЏ СѓС‡РµРЅРёРєР° */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto relative">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenChat(selectedStudent.studentId, selectedStudent.studentName)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>РќР°РїРёСЃР°С‚СЊ</span>
                  </button>
                  <button
                    onClick={() => handleOpenCalendar({ id: selectedStudent.studentId, name: selectedStudent.studentName })}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>РќР°Р·РЅР°С‡РёС‚СЊ СѓСЂРѕРє</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex flex-col lg:flex-row gap-6 mb-8">
                <div className="flex flex-col items-center lg:items-start">
                  {selectedProfile?.avatar && selectedProfile.avatar.trim() !== '' ? (
                    <img 
                      src={selectedProfile.avatar} 
                      alt="avatar" 
                      className="w-32 h-32 rounded-full object-cover mb-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center mb-4 ${selectedProfile?.avatar && selectedProfile.avatar.trim() !== '' ? 'hidden' : ''}`}>
                    <UserIcon className="h-16 w-16 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedStudent.studentName}</h1>
                  {selectedProfile?.grade && (
                    <div className="flex items-center text-lg text-gray-600 mb-2">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      <span>{selectedProfile.grade} РєР»Р°СЃСЃ</span>
                    </div>
                  )}
                  {selectedProfile?.age && (
                    <div className="text-gray-600 mb-2">
                      <span className="font-medium">Р’РѕР·СЂР°СЃС‚:</span> {selectedProfile.age} Р»РµС‚
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {studentsMap[selectedStudent.studentId]?.lessons.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Р’СЃРµРіРѕ СѓСЂРѕРєРѕРІ</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {studentsMap[selectedStudent.studentId]?.lessons.filter(l => l.status === 'completed').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Р—Р°РІРµСЂС€РµРЅРѕ</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedProfile?.subjects?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">РџСЂРµРґРјРµС‚РѕРІ</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">
                      {selectedProfile?.experience ? 
                        (selectedProfile.experience === 'beginner' ? 'РќР°С‡РёРЅР°СЋС‰РёР№' : 
                         selectedProfile.experience === 'intermediate' ? 'РЎСЂРµРґРЅРёР№' : 'РџСЂРѕРґРІРёРЅСѓС‚С‹Р№') 
                        : 'РќРµ СѓРєР°Р·Р°РЅ'}
                    </div>
                    <div className="text-sm text-gray-600">РЈСЂРѕРІРµРЅСЊ</div>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    Р›РёС‡РЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ
                  </h3>
                  <div className="space-y-3">
                    {selectedProfile?.school && (
                      <div className="flex items-center text-gray-700">
                        <School className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">РЁРєРѕР»Р°:</span>
                        <span>{selectedProfile.school}</span>
                      </div>
                    )}
                    {selectedProfile?.city && (
                      <div className="flex items-center text-gray-700">
                        <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">Р“РѕСЂРѕРґ:</span>
                        <span>{selectedProfile.city}</span>
                      </div>
                    )}
                    {selectedProfile?.phone && (
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">РўРµР»РµС„РѕРЅ:</span>
                        <span>{selectedProfile.phone}</span>
                      </div>
                    )}
                    {selectedProfile?.parentName && (
                      <div className="flex items-center text-gray-700">
                        <User className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">Р РѕРґРёС‚РµР»СЊ:</span>
                        <span>{selectedProfile.parentName}</span>
                      </div>
                    )}
                    {selectedProfile?.parentPhone && (
                      <div className="flex items-center text-gray-700">
                        <Phone className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">РўРµР»РµС„РѕРЅ СЂРѕРґРёС‚РµР»СЏ:</span>
                        <span>{selectedProfile.parentPhone}</span>
                      </div>
                    )}
                    {selectedProfile?.timeZone && (
                      <div className="flex items-center text-gray-700">
                        <Clock className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">Р§Р°СЃРѕРІРѕР№ РїРѕСЏСЃ:</span>
                        <span>{selectedProfile.timeZone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                    РЈС‡РµР±РЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ
                  </h3>
                  <div className="space-y-3">
                    {selectedProfile?.subjects && selectedProfile.subjects.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">РР·СѓС‡Р°РµРјС‹Рµ РїСЂРµРґРјРµС‚С‹:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.subjects.map((subject, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedProfile?.goals && selectedProfile.goals.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Р¦РµР»Рё РѕР±СѓС‡РµРЅРёСЏ:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.goals.map((goal, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedProfile?.learningStyle && (
                      <div className="flex items-center text-gray-700">
                        <Target className="w-4 h-4 mr-3 text-gray-400" />
                        <span className="font-medium mr-2">РЎС‚РёР»СЊ РѕР±СѓС‡РµРЅРёСЏ:</span>
                        <span>{selectedProfile.learningStyle === 'visual' ? 'Р’РёР·СѓР°Р»СЊРЅС‹Р№' : 
                               selectedProfile.learningStyle === 'auditory' ? 'РђСѓРґРёР°Р»СЊРЅС‹Р№' :
                               selectedProfile.learningStyle === 'kinesthetic' ? 'РљРёРЅРµСЃС‚РµС‚РёС‡РµСЃРєРёР№' : 'РЎРјРµС€Р°РЅРЅС‹Р№'}</span>
                      </div>
                    )}
                    {selectedProfile?.preferredFormats && selectedProfile.preferredFormats.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">РџСЂРµРґРїРѕС‡РёС‚Р°РµРјС‹Рµ С„РѕСЂРјР°С‚С‹:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.preferredFormats.map((format, index) => (
                            <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                              {format}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedProfile?.preferredDurations && selectedProfile.preferredDurations.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">РџСЂРµРґРїРѕС‡РёС‚Р°РµРјР°СЏ РґР»РёС‚РµР»СЊРЅРѕСЃС‚СЊ:</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedProfile.preferredDurations.map((duration, index) => (
                            <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                              {duration} РјРёРЅ
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interests & Hobbies */}
                {selectedProfile?.interests && selectedProfile.interests.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-red-500" />
                      РРЅС‚РµСЂРµСЃС‹ Рё С…РѕР±Р±Рё
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.interests.map((interest, index) => (
                        <span key={index} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Biography */}
                {selectedProfile?.bio && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                      Рћ СЃРµР±Рµ
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{selectedProfile.bio}</p>
                  </div>
                )}
              </div>

              {/* Lessons History */}
              {studentsMap[selectedStudent.studentId]?.lessons && studentsMap[selectedStudent.studentId].lessons.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                    РСЃС‚РѕСЂРёСЏ СѓСЂРѕРєРѕРІ
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      {studentsMap[selectedStudent.studentId].lessons.map((lesson, index) => (
                        <div key={lesson.id} className={`p-4 border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{lesson.subject}</h4>
                              <p className="text-sm text-gray-600">
                                {lesson.date} РІ {lesson.startTime}-{lesson.endTime}
                              </p>
                              {lesson.comment && (
                                <p className="text-sm text-gray-500 mt-1">{lesson.comment}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                lesson.status === 'completed' ? 'bg-green-100 text-green-800' :
                                lesson.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {lesson.status === 'completed' ? 'Р—Р°РІРµСЂС€РµРЅ' :
                                 lesson.status === 'scheduled' ? 'Р—Р°РїР»Р°РЅРёСЂРѕРІР°РЅ' : 'РћС‚РјРµРЅРµРЅ'}
                              </span>
                              <span className="text-sm font-medium text-gray-900">{lesson.price} в‚Ѕ</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No Profile Data */}
              {!selectedProfile && (
                <div className="text-center py-12">
                  <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">РџСЂРѕС„РёР»СЊ РЅРµ Р·Р°РїРѕР»РЅРµРЅ</h3>
                  <p className="text-gray-600">РЈС‡РµРЅРёРє РµС‰Рµ РЅРµ Р·Р°РїРѕР»РЅРёР» РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ СЃРµР±Рµ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* РњРѕРґР°Р»СЊРЅРѕРµ РѕРєРЅРѕ РґР»СЏ РЅР°Р·РЅР°С‡РµРЅРёСЏ СѓСЂРѕРєР° */}
      {assignModalOpen && assigningStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              onClick={() => setAssignModalOpen(false)}
              title="Р—Р°РєСЂС‹С‚СЊ"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3>РќР°Р·РЅР°С‡РёС‚СЊ СѓСЂРѕРє РґР»СЏ {assigningStudent.name}</h3>
            <form className="flex flex-col gap-2">
              <input type="text" placeholder="РџСЂРµРґРјРµС‚" value={slotForm.subject} onChange={e => setSlotForm({ ...slotForm, subject: e.target.value })} required />
              <input type="date" value={slotForm.date} onChange={e => setSlotForm({ ...slotForm, date: e.target.value })} required />
              <input type="time" value={slotForm.startTime} onChange={e => setSlotForm({ ...slotForm, startTime: e.target.value })} required />
              <input type="time" value={slotForm.endTime} onChange={e => setSlotForm({ ...slotForm, endTime: e.target.value })} required />
              <input type="number" placeholder="Р¦РµРЅР°" value={slotForm.price} onChange={e => setSlotForm({ ...slotForm, price: Number(e.target.value) })} />
              <select value={slotForm.lessonType} onChange={e => setSlotForm({ ...slotForm, lessonType: e.target.value as 'regular' | 'trial' })}>
                <option value="regular">РћР±С‹С‡РЅС‹Р№</option>
                <option value="trial">РџСЂРѕР±РЅС‹Р№</option>
              </select>
              <select value={slotForm.format} onChange={e => setSlotForm({ ...slotForm, format: e.target.value as 'online' | 'offline' })}>
                <option value="online">РћРЅР»Р°Р№РЅ</option>
                <option value="offline">РћС„С„Р»Р°Р№РЅ</option>
              </select>
              <select value={slotForm.experience} onChange={e => setSlotForm({ ...slotForm, experience: e.target.value as 'beginner' | 'experienced' })}>
                <option value="beginner">РќР°С‡РёРЅР°СЋС‰РёР№</option>
                <option value="experienced">РћРїС‹С‚РЅС‹Р№</option>
              </select>
              {error && <div className="text-red-500">{error}</div>}
              <button type="button" className="btn btn-success mt-2" onClick={handleCreateAndBookSlot} disabled={loading}>
                {loading ? 'РќР°Р·РЅР°С‡РµРЅРёРµ...' : 'РќР°Р·РЅР°С‡РёС‚СЊ'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* РњРѕРґР°Р»СЊРЅРѕРµ РѕРєРЅРѕ СЃ РєР°Р»РµРЅРґР°СЂС‘Рј РґР»СЏ РІС‹Р±РѕСЂР° СЃР»РѕС‚Р° */}
      {calendarModalOpen && calendarStudent && (
        <Modal open={calendarModalOpen} onClose={() => setCalendarModalOpen(false)}>
          <div style={{ minWidth: 1100, minHeight: 600, maxWidth: '98vw' }}>
            <h2 style={{ marginBottom: 16 }}>РќР°Р·РЅР°С‡РёС‚СЊ СѓСЂРѕРє РґР»СЏ {calendarStudent.name}</h2>
            <TeacherCalendar
              mode="assign"
              student={calendarStudent}
              onAssign={() => setCalendarModalOpen(false)}
            />
          </div>
        </Modal>
      )}

      {/* РњРѕРґР°Р»СЊРЅРѕРµ РѕРєРЅРѕ РїСЂРѕС„РёР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ */}
      {selectedUserProfile && (
        <UserProfile
          userId={selectedUserProfile}
          onClose={() => setSelectedUserProfile(null)}
          onMessage={(userId) => {
            setSelectedUserProfile(null);
          }}
          onBookLesson={(teacherId) => {
            setSelectedUserProfile(null);
          }}
          isModal={true}
        />
      )}
    </div>
  );
};
export default TeacherStudents;
