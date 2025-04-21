
import React, { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  readOnly?: boolean;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value, onChange, className="", style={}, readOnly=false, minHeight="300px"
}) => {
  const quillRef = useRef<ReactQuill>(null);
  
  // Handle content change without losing focus
  const handleChange = (content: string) => {
    onChange(content);
  };
  
  // Help maintain focus and cursor position
  useEffect(() => {
    // Prevent initial focus for better UX
    const editor = quillRef.current?.getEditor();
    if (editor && !readOnly) {
      // Set tabindex to ensure it's keyboard accessible
      const editorElement = editor.root;
      if (editorElement) {
        editorElement.setAttribute('tabindex', '0');
      }
    }
  }, [readOnly]);
  
  return (
    <div className="quill-container" style={{ 
      height: minHeight, 
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <ReactQuill
        ref={quillRef}
        value={value}
        onChange={handleChange}
        className={`${className} flex-grow`}
        theme={readOnly ? 'bubble' : 'snow'}
        readOnly={readOnly}
        style={{
          background: readOnly ? "transparent" : "#fff",
          height: "100%",
          ...style,
        }}
        modules={{
          toolbar: readOnly ? false : [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
          ]
        }}
        formats={[
          'header', 'bold', 'italic', 'underline', 'strike',
          'list', 'bullet', 'indent', 'align',
          'blockquote', 'code-block',
          'link', 'image'
        ]}
        preserveWhitespace={true}
      />
    </div>
  );
};

export default RichTextEditor;
