import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Users, 
  Edit, 
  Trash2, 
  UserPlus, 
  Search,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Eye
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { useAuth } from "../../contexts/AuthContext";
import { SERVER_URL } from "../../config";
import type { StudentProfile } from "../../types";
import { Lesson } from "../../types";
import ClassDetails from "../Shared/ClassDetails";

interface Class {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade: string;
  students: string[];
  teacherId: string;
  createdAt: string;
  color: string;
}

interface StudentWithProfile {
  id: string;
  name: string;
  profile?: StudentProfile;
  lessons: Lesson[];
}

const TeacherClasses: React.FC = () => {
  const { user } = useAuth();
  const { lessons } = useData();
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<StudentWithProfile[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedClassForDetails, setSelectedClassForDetails] = useState<Class | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Форма для создания класса
  const [classForm, setClassForm] = useState({
    name: "",
    description: "",
    subject: "",
    grade: "",
    color: "#3B82F6"
  });

  // Цвета для классов
  const classColors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
  ];

  // Загрузка классов и учеников
  useEffect(() => {
    loadClasses();
    loadStudents();
  }, []);

  const loadClasses = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/classes?teacherId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadStudents = async () => {
    try {
      // Получаем всех учеников, которые бронировали уроки у этого преподавателя
      const teacherLessons = lessons.filter((lesson: Lesson) => lesson.teacherId === user?.id);
      const studentsMap: Record<string, StudentWithProfile> = {};
      
      teacherLessons.forEach((lesson: Lesson) => {
        if (!studentsMap[lesson.studentId]) {
          studentsMap[lesson.studentId] = {
            id: lesson.studentId,
            name: lesson.studentName,
            lessons: []
          };
        }
        studentsMap[lesson.studentId].lessons.push(lesson);
      });

      setStudents(Object.values(studentsMap));
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const createClass = async () => {
    if (!classForm.name.trim()) {
      setError("Название класса обязательно");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${SERVER_URL}/api/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...classForm,
          teacherId: user?.id
        })
      });

      if (response.ok) {
        const newClass = await response.json();
        setClasses([...classes, newClass]);
        setShowCreateModal(false);
        setClassForm({ name: "", description: "", subject: "", grade: "", color: "#3B82F6" });
      } else {
        setError("Ошибка при создании класса");
      }
    } catch (error) {
      setError("Ошибка при создании класса");
    } finally {
      setLoading(false);
    }
  };

  const addStudentToClass = async (studentId: string, classId: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      });

      if (response.ok) {
        // Обновляем локальное состояние
        setClasses(classes.map(cls => 
          cls.id === classId 
            ? { ...cls, students: [...cls.students, studentId] }
            : cls
        ));
        setShowAddStudentModal(false);
      } else {
        setError("Ошибка при добавлении ученика в класс");
      }
    } catch (error) {
      setError("Ошибка при добавлении ученика в класс");
    }
  };

  const removeStudentFromClass = async (studentId: string, classId: string) => {
    try {
      const response = await fetch(`${SERVER_URL}/api/classes/${classId}/students/${studentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setClasses(classes.map(cls => 
          cls.id === classId 
            ? { ...cls, students: cls.students.filter(id => id !== studentId) }
            : cls
        ));
      }
    } catch (error) {
      setError("Ошибка при удалении ученика из класса");
    }
  };

  const deleteClass = async (classId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот класс?")) return;

    try {
      const response = await fetch(`${SERVER_URL}/api/classes/${classId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setClasses(classes.filter(cls => cls.id !== classId));
      }
    } catch (error) {
      setError("Ошибка при удалении класса");
    }
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Классы</h1>
            <p className="text-gray-600">Управляйте классами и распределяйте учеников по группам</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Создать класс</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {classes.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет классов</h3>
          <p className="text-gray-600 mb-4">Создайте первый класс для организации учеников</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Создать класс
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div 
                className="h-3 w-full" 
                style={{ backgroundColor: cls.color }}
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{cls.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedClassForDetails(cls)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Открыть класс"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClass(cls);
                        setShowAddStudentModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Добавить ученика"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteClass(cls.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Удалить класс"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {cls.description && (
                  <p className="text-gray-600 mb-4">{cls.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  {cls.subject && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{cls.subject}</span>
                    </div>
                  )}
                  {cls.grade && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <GraduationCap className="w-4 h-4" />
                      <span>{cls.grade} класс</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{cls.students.length} учеников</span>
                  </div>
                </div>

                {/* Список учеников в классе */}
                {cls.students.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ученики:</h4>
                    <div className="space-y-1">
                      {cls.students.map(studentId => {
                        const student = students.find(s => s.id === studentId);
                        return student ? (
                          <div key={studentId} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{student.name}</span>
                            <button
                              onClick={() => removeStudentFromClass(studentId, cls.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Удалить из класса"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания класса */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Создать класс</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createClass(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название класса *
                  </label>
                  <input
                    type="text"
                    value={classForm.name}
                    onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Например: Математика 9 класс"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={classForm.description}
                    onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Краткое описание класса"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Предмет
                    </label>
                    <input
                      type="text"
                      value={classForm.subject}
                      onChange={(e) => setClassForm({ ...classForm, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Математика"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Класс
                    </label>
                    <input
                      type="text"
                      value={classForm.grade}
                      onChange={(e) => setClassForm({ ...classForm, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="9"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цвет класса
                  </label>
                  <div className="flex space-x-2">
                    {classColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setClassForm({ ...classForm, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          classForm.color === color ? 'border-gray-400' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Создание...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Создать</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно добавления ученика в класс */}
      {showAddStudentModal && selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Добавить ученика в "{selectedClass.name}"
              </h3>
              <button
                onClick={() => setShowAddStudentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Поиск ученика..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredStudents
                .filter(student => !selectedClass.students.includes(student.id))
                .map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          {student.lessons.length} уроков
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => addStudentToClass(student.id, selectedClass.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Добавить
                    </button>
                  </div>
                ))}
            </div>

            {filteredStudents.filter(student => !selectedClass.students.includes(student.id)).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Ученики не найдены' : 'Нет доступных учеников'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно детального просмотра класса */}
      {selectedClassForDetails && (
        <ClassDetails
          classData={selectedClassForDetails}
          onClose={() => setSelectedClassForDetails(null)}
          userRole="teacher"
        />
      )}
    </div>
  );
};

export default TeacherClasses;
