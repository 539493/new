import React, { useState } from 'react';

const TeacherMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<Array<{ id: string; title: string; url?: string }>>([]);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');

  const addMaterial = () => {
    if (!title.trim()) return;
    setMaterials((prev) => [
      { id: Math.random().toString(36).slice(2), title: title.trim(), url: link.trim() || undefined },
      ...prev,
    ]);
    setTitle('');
    setLink('');
  };

  const removeMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text">Материалы</h1>
        <p className="text-gray-600">Сохраняйте ссылки и описания материалов для занятий</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название материала"
            className="input-modern w-full"
          />
          <input
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Ссылка (необязательно)"
            className="input-modern w-full"
          />
          <button onClick={addMaterial} className="btn-primary">Добавить</button>
        </div>
      </div>

      <div className="space-y-3">
        {materials.length === 0 ? (
          <div className="text-gray-500 text-center py-12 bg-white rounded-2xl shadow">Пока нет материалов</div>
        ) : (
          materials.map((m) => (
            <div key={m.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{m.title}</div>
                {m.url && (
                  <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm break-all">
                    {m.url}
                  </a>
                )}
              </div>
              <button onClick={() => removeMaterial(m.id)} className="text-red-600 hover:text-red-700">Удалить</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherMaterials;


