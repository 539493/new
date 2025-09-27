import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

type MaterialItem = {
  id: string;
  title: string;
  url?: string; // external link
  fileName?: string;
  fileType?: string;
  dataUrl?: string; // base64 data URL for storage/preview
  createdAt: string;
};

const TeacherMaterials: React.FC = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<MaterialItem | null>(null);
  const [query, setQuery] = useState('');

  const storageKey = user ? `teacher_materials_${user.id}` : undefined;

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setMaterials(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(materials));
    } catch {}
  }, [materials, storageKey]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected);
  };

  const addMaterial = async () => {
    if (!title.trim() && files.length === 0 && !link.trim()) return;

    // Convert selected files to data URLs for persistence
    const fileItems: MaterialItem[] = await Promise.all(
      files.map(
        (file) =>
          new Promise<MaterialItem>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              resolve({
                id: Math.random().toString(36).slice(2),
                title: title.trim() || file.name,
                fileName: file.name,
                fileType: file.type,
                dataUrl: String(reader.result || ''),
                createdAt: new Date().toISOString(),
              });
            };
            reader.readAsDataURL(file);
          })
      )
    );

    const linkItem: MaterialItem | null = link.trim()
      ? {
          id: Math.random().toString(36).slice(2),
          title: title.trim() || link.trim(),
          url: link.trim(),
          createdAt: new Date().toISOString(),
        }
      : null;

    const itemsToAdd = [linkItem, ...fileItems].filter(Boolean) as MaterialItem[];
    if (itemsToAdd.length === 0) return;

    setMaterials((prev) => [...itemsToAdd, ...prev]);
    setTitle('');
    setLink('');
    setFiles([]);
    const input = document.getElementById('materials-file-input') as HTMLInputElement | null;
    if (input) input.value = '';
  };

  const removeMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const renameMaterial = (id: string, newTitle: string) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, title: newTitle.trim() || m.title } : m)));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text">Материалы</h1>
        <p className="text-gray-600">Сохраняйте ссылки и описания материалов для занятий</p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <input
            id="materials-file-input"
            type="file"
            multiple
            onChange={handleFilesChange}
            className="input-modern w-full"
            accept=".pdf,.doc,.docx,.ppt,.pptx,image/*,.txt,.xlsx,.xls,.csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
          />
          <button onClick={addMaterial} className="btn-primary">Добавить</button>
        </div>
        {files.length > 0 && (
          <div className="mt-3 text-xs text-gray-600">
            Выбрано файлов: {files.length}
          </div>
        )}
        <div className="mt-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию или ссылке"
            className="input-modern w-full"
          />
        </div>
      </div>

      <div className="space-y-3">
        {materials.length === 0 ? (
          <div className="text-gray-500 text-center py-12 bg-white rounded-2xl shadow">Пока нет материалов</div>
        ) : (
          materials
            .filter((m) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              return (
                m.title.toLowerCase().includes(q) ||
                (m.url ? m.url.toLowerCase().includes(q) : false) ||
                (m.fileName ? m.fileName.toLowerCase().includes(q) : false)
              );
            })
            .map((m) => (
            <div key={m.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
              <div className="min-w-0">
                <InlineTitle title={m.title} onSave={(val) => renameMaterial(m.id, val)} />
                {m.url && (
                  <a href={m.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm break-all">
                    {m.url}
                  </a>
                )}
                {m.dataUrl && (
                  <div className="text-xs text-gray-500 mt-1">
                    {m.fileName} {m.fileType && `• ${m.fileType}`}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                {(m.dataUrl || m.url) && (
                  <button
                    onClick={() => {
                      if (m.dataUrl) {
                        setPreview(m);
                      } else if (m.url) {
                        window.open(m.url, '_blank');
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Открыть
                  </button>
                )}
                {m.dataUrl && (
                  <a
                    href={m.dataUrl}
                    download={m.fileName || 'material'}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Скачать
                  </a>
                )}
                <button onClick={() => removeMaterial(m.id)} className="text-red-600 hover:text-red-700">Удалить</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[80vh] overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3 border-b">
              <div className="font-semibold truncate pr-4">{preview.title}</div>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setPreview(null)}>Закрыть</button>
            </div>
            <div className="w-full h-[calc(80vh-52px)] bg-gray-50 flex items-center justify-center">
              {preview.dataUrl && preview.fileType?.startsWith('image/') && (
                <img src={preview.dataUrl} alt={preview.title} className="max-h-full max-w-full object-contain" />
              )}
              {preview.dataUrl && preview.fileType === 'application/pdf' && (
                <iframe title="pdf" src={preview.dataUrl} className="w-full h-full" />
              )}
              {preview.dataUrl && preview.fileType?.startsWith('text/') && (
                <iframe title="text" src={preview.dataUrl} className="w-full h-full bg-white" />
              )}
              {preview.dataUrl && !(/^(image\/|application\/pdf|text\/).*/.test(preview.fileType || '')) && (
                <div className="p-6 text-center text-gray-600">
                  Онлайн-просмотр для этого формата не поддерживается. Скачайте файл для просмотра.
                </div>
              )}
              {preview.url && !preview.dataUrl && (
                <iframe title="url" src={preview.url} className="w-full h-full bg-white" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Небольшой компонент для инлайн-редактирования названия
const InlineTitle: React.FC<{ title: string; onSave: (v: string) => void }> = ({ title, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  useEffect(() => setValue(title), [title]);
  if (!editing) {
    return (
      <div className="font-semibold text-gray-900 truncate max-w-md" title={title} onDoubleClick={() => setEditing(true)}>
        {title}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { onSave(value); setEditing(false); } }}
        className="input-modern"
        autoFocus
      />
      <button className="btn-primary" onClick={() => { onSave(value); setEditing(false); }}>OK</button>
      <button className="btn-secondary" onClick={() => { setValue(title); setEditing(false); }}>Отмена</button>
    </div>
  );
};

export default TeacherMaterials;


