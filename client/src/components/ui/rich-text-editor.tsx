import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'color': [] }, { 'background': [] }],
    ['link', 'image'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'color', 'background',
  'link', 'image'
];

const RichTextEditor = ({ value, onChange, placeholder, className = '' }: RichTextEditorProps) => {
  // Initialize with empty string to avoid controlled/uncontrolled warning
  const [editorValue, setEditorValue] = useState('');
  
  // Set initial value after component mounts
  useEffect(() => {
    setEditorValue(value || '');
  }, []);
  
  // Update local state and call parent onChange when value changes
  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };
  
  return (
    <div className={`rich-text-editor ${className}`}>
      <ReactQuill 
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Write something...'}
        className="min-h-[200px]"
      />
    </div>
  );
};

export default RichTextEditor;